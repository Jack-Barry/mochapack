import { defaults as _defaults } from 'lodash'
/*
import parseConfig from 'mocha/lib/cli/config'
*/
import parseArgv from './parseArgv'
import Mochapack from '../Mochapack'
/*
import requireWebpackConfig from '../../cli/requireWebpackConfig'
import { ensureGlob, extensionsToGlob } from '../../util/glob'
import createMochapack from '../createMochapack'
import { exit, resolve } from './helpers'
import { MochaOptions } from 'mocha'
*/

async function cli() {
  // Parse CLI options
  const cliOptions = parseArgv(process.argv.slice(2), true)

  // Parse config options
  // Will Mocha's config parser return config file if it provides MochapackOptions?
  /*
  const configOptions: MochaOptions = parseConfig(cliOptions.mochaOptions)
  const requiresWebpackConfig =
    cliOptions.webpackConfig != null || configOptions.webpackConfig != null
  */

  // Determine options to use while running
  //   Prefer CLI to config, prefer config to defaults
  //   Can probably split everything up to and including this into its own
  //     function for easier testing, something like buildMochapackOptions()
  const options = _defaults(
    {},
    cliOptions,
    /* configOptions, */ Mochapack.defaultOptions
  )

  // Require/import any applicable modules
  // Do these need to be required here or by the Mocha initializer?
  /*
  options.require.forEach(mod => {
    require(resolve(mod)) // eslint-disable-line global-require, import/no-dynamic-require
  })
  */

  // Require/import Webpack config
  /*
  options.webpackConfig = await requireWebpackConfig(
    options.webpackConfig,
    requiresWebpackConfig,
    options.webpackEnv,
    options.mode
  )
  */

  // Create instance of Mochapack using options
  //   Since the Mochapack class is no longer extending Mocha, could
  //   potentially initialize it with options instead of using all these method
  //   calls
  /*
  options.include = options.include.map(resolve)

  const mochapack = createMochapack()

  options.include.forEach(f => mochaWebpack.addInclude(f))

  const extensions = _.get(options.webpackConfig, 'resolve.extensions', ['.js'])
  const fallbackFileGlob = extensionsToGlob(extensions)
  const fileGlob = options.glob != null ? options.glob : fallbackFileGlob

  options.files.forEach(f =>
    mochaWebpack.addEntry(ensureGlob(f, options.recursive, fileGlob))
  )

  mochapack.webpackConfig(options.webpackConfig)
  mochapack.interactive(options.interactive)
  mochapack.clearTerminal(options.clearTerminal)

  if (options.quiet) {
    mochapack.quiet()
  }
  */

  // Use configured Mochapack to run (and watch if applicable) Mocha
  //   Will no longer be the Mochapack instance - can set the instance of Mocha
  //   as mochapack.mocha and call run on that as applicable or mochapack.watch
  //   since the watch method needs to behave differently than normal Mocha
  //   watch
  /*
  await Promise.resolve()
    .then(() => {
      if (options.watch) {
        return mochapack.watch()
      }
      return mochapack.run()
    })
    .then(failures => {
      exit(options.exit, failures)
    })
    .catch(e => {
      if (e) {
        console.error(e.stack) // eslint-disable-line
      }
      exit(options.exit, 1)
    })
    */
}

cli()
