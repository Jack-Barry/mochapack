import path from 'path'
import EventEmitter from 'events'
import _ from 'lodash'
import chokidar from 'chokidar'
import minimatch from 'minimatch'
import {
  Configuration as WebpackConfig,
  Compiler,
  Stats,
  Plugin,
  Output
} from 'webpack'

import { glob } from '../util/glob'
import createCompiler from '../webpack/compiler/createCompiler'
import createWatchCompiler, {
  WatchCompiler
} from '../webpack/compiler/createWatchCompiler'
import registerInMemoryCompiler from '../webpack/compiler/registerInMemoryCompiler'
import registerReadyCallback from '../webpack/compiler/registerReadyCallback'
import { EntryConfig } from '../webpack/loader/entryLoader'
import configureMocha from './configureMocha'
import getBuildStats, { BuildStats } from '../webpack/util/getBuildStats'
import buildProgressPlugin from '../webpack/plugin/buildProgressPlugin'

import { MochaWebpackOptions } from '../MochaWebpack'

const entryPath = path.resolve(__dirname, '../entry.js')
const entryLoaderPath = path.resolve(
  __dirname,
  '../webpack/loader/entryLoader.js'
)
const includeLoaderPath = path.resolve(
  __dirname,
  '../webpack/loader/includeFilesLoader.js'
)
const noop = () => undefined

type MochaRunner = {
  abort: () => void
  currentRunnable?: {
    retries: (count: number) => void
    enableTimeouts: (enabled: boolean) => void
    timeout: (ms: number) => void
    resetTimeout: (ms: number) => void
  }
}
type Mocha = {
  run: (cb: (failures: number) => void) => MochaRunner
}

export default class TestRunner extends EventEmitter {
  entries: Array<string>
  includes: Array<string>
  options: MochaWebpackOptions

  constructor(
    entries: Array<string>,
    includes: Array<string>,
    options: MochaWebpackOptions
  ) {
    super()
    this.entries = entries
    this.includes = includes

    this.options = options
  }

  prepareMocha(webpackConfig: WebpackConfig, stats: Stats): Mocha {
    const mocha: Mocha = configureMocha(this.options)
    const outputPath: string = (webpackConfig.output as Output).path as string
    const buildStats: BuildStats = getBuildStats(stats, outputPath)

    // @ts-ignore
    global.__webpackManifest__ = buildStats.affectedModules // eslint-disable-line

    // clear up require cache for changed files to make sure that we get the latest changes
    buildStats.affectedFiles.forEach(filePath => {
      delete require.cache[filePath]
    })
    // pass webpack's entry files to mocha
    ;(mocha as any).files = buildStats.entries
    return mocha
  }

  async run(): Promise<number> {
    const { webpackConfig: config } = await this.createWebpackConfig()
    let failures = 0
    const compiler: Compiler = createCompiler(config)

    compiler.hooks.run.tapAsync('mochapack', (c, cb) => {
      this.emit('webpack:start')
      cb()
    })

    const dispose = registerInMemoryCompiler(compiler)
    try {
      failures = await new Promise((resolve, reject) => {
        registerReadyCallback(
          compiler,
          (err: (Error | string) | null, webpackStats: Stats | null) => {
            this.emit('webpack:ready', err, webpackStats)
            if (err || !webpackStats) {
              reject()
              return
            }
            try {
              const mocha = this.prepareMocha(config, webpackStats)
              this.emit('mocha:begin')
              try {
                mocha.run(fails => {
                  this.emit('mocha:finished', fails)
                  resolve(fails)
                })
              } catch (e) {
                this.emit('exception', e)
                resolve(1)
              }
            } catch (e) {
              reject(e)
            }
          }
        )
        compiler.run(noop)
      })
    } finally {
      // clean up single run
      dispose()
    }
    return failures
  }

  async watch(): Promise<void> {
    const {
      webpackConfig: config,
      entryConfig
    } = await this.createWebpackConfig()

    let mochaRunner: MochaRunner | null = null
    let stats: Stats | null = null
    let compilationScheduler: (() => void) | null = null

    const uncaughtExceptionListener = err => {
      // mocha catches uncaughtException only while tests are running,
      // that's why we register a custom error handler to keep this process alive
      this.emit('uncaughtException', err)
    }

    const runMocha = () => {
      try {
        const mocha = this.prepareMocha(config, stats as Stats)
        // unregister our custom exception handler (see declaration)
        process.removeListener('uncaughtException', uncaughtExceptionListener)

        // run tests
        this.emit('mocha:begin')
        mochaRunner = mocha.run(
          _.once(failures => {
            // register custom exception handler to catch all errors that may happen after mocha think tests are done
            process.on('uncaughtException', uncaughtExceptionListener)

            // need to wait until next tick, otherwise mochaRunner = null doesn't work..
            process.nextTick(() => {
              mochaRunner = null
              if (compilationScheduler != null) {
                this.emit('mocha:aborted')
                compilationScheduler()
                compilationScheduler = null
              } else {
                this.emit('mocha:finished', failures)
              }
            })
          })
        )
      } catch (err) {
        this.emit('exception', err)
      }
    }

    const compiler = createCompiler(config)
    registerInMemoryCompiler(compiler)
    // register webpack start callback
    compiler.hooks.watchRun.tapAsync('mochapack', (c, cb) => {
      // check if mocha tests are still running, abort them and start compiling
      if (mochaRunner) {
        compilationScheduler = () => {
          this.emit('webpack:start')
          cb()
        }

        mochaRunner.abort()
        // make sure that the current running test will be aborted when timeouts are disabled for async tests
        if (mochaRunner.currentRunnable) {
          const runnable = mochaRunner.currentRunnable
          runnable.retries(0)
          runnable.enableTimeouts(true)
          runnable.timeout(1)
          runnable.resetTimeout(1)
        }
      } else {
        this.emit('webpack:start')
        cb()
      }
    })
    // register webpack ready callback
    registerReadyCallback(
      compiler,
      (err: (Error | string) | null, webpackStats: Stats | null) => {
        this.emit('webpack:ready', err, webpackStats)
        if (err) {
          // wait for fixed tests
          return
        }
        stats = webpackStats
        runMocha()
      }
    )

    const watchCompiler: WatchCompiler = createWatchCompiler(
      compiler,
      (config as any).watchOptions
    )
    // start webpack build immediately
    watchCompiler.watch()

    // webpack enhances watch options, that's why we use them instead
    const watchOptions = watchCompiler.getWatchOptions()
    const pollingInterval =
      typeof watchOptions.poll === 'number' ? watchOptions.poll : undefined
    // create own file watcher for entry files to detect created or deleted files
    const watcher = chokidar.watch(this.entries, {
      cwd: this.options.cwd,
      // see https://github.com/webpack/watchpack/blob/e5305b53ac3cf2a70d49a772912b115fa77665c2/lib/DirectoryWatcher.js
      ignoreInitial: true,
      persistent: true,
      followSymlinks: false,
      ignorePermissionErrors: true,
      ignored: watchOptions.ignored,
      usePolling: watchOptions.poll ? true : undefined,
      interval: pollingInterval,
      binaryInterval: pollingInterval
    })

    const restartWebpackBuild = _.debounce(
      () => watchCompiler.watch(),
      watchOptions.aggregateTimeout
    )
    const fileDeletedOrAdded = (file, deleted) => {
      const matchesGlob = this.entries.some(pattern => minimatch(file, pattern))
      // Chokidar gives files not matching pattern sometimes, prevent this
      if (matchesGlob) {
        const filePath = path.join(this.options.cwd, file)
        if (deleted) {
          this.emit('entry:removed', file)
          entryConfig.removeFile(filePath)
        } else {
          this.emit('entry:added', file)
          entryConfig.addFile(filePath)
        }

        // pause webpack watch immediately before webpack will be notified
        watchCompiler.pause()
        // call debounced webpack runner to rebuild files
        restartWebpackBuild()
      }
    }

    // add listener for entry creation & deletion events
    watcher.on('add', file => fileDeletedOrAdded(file, false))
    watcher.on('unlink', file => fileDeletedOrAdded(file, true))

    return new Promise(() => undefined) // never ending story
  }

  async createWebpackConfig() {
    const { webpackConfig } = this.options

    const files = await glob(this.entries, {
      cwd: this.options.cwd,
      absolute: true
    })

    const entryConfig = new EntryConfig()
    files.forEach(f => entryConfig.addFile(f))

    const tmpPath = path.join(
      this.options.cwd,
      '.tmp',
      'mochapack',
      Date.now().toString()
    )
    const withCustomPath = _.has(webpackConfig, 'output.path')
    const outputPath = path.normalize(
      _.get(webpackConfig, 'output.path', tmpPath)
    )
    const publicPath = withCustomPath
      ? _.get(webpackConfig, 'output.publicPath', undefined)
      : outputPath + path.sep

    const plugins: Plugin[] = []

    if (this.options.interactive) {
      plugins.push(buildProgressPlugin())
    }

    const userLoaders = _.get(webpackConfig, 'module.rules', [])
    userLoaders.unshift({
      test: entryPath,
      use: [
        {
          loader: includeLoaderPath,
          options: {
            include: this.includes
          }
        },
        {
          loader: entryLoaderPath,
          options: {
            entryConfig
          }
        }
      ]
    })

    const config = {
      ...webpackConfig,
      entry: entryPath,
      module: {
        ...(webpackConfig as any).module,
        rules: userLoaders
      },
      output: {
        ...(webpackConfig as any).output,
        path: outputPath,
        publicPath
      },
      plugins: [...((webpackConfig as any).plugins || []), ...plugins]
    }
    return {
      webpackConfig: config,
      entryConfig
    }
  }
}
