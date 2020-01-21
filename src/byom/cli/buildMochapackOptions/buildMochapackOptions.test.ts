import { expect } from 'chai'
import path from 'path'
import buildMochapackOptions from '.'
import Mochapack, { MochapackOptions } from '../../Mochapack'
import { expectPartialMatch } from '../../../../test/helpers/helpers'
import { mochapackYargsOptionKeys } from '../options'

describe('buildMochapackOptions', () => {
  let p: NodeJS.Process
  let builtOptions: MochapackOptions
  const fixturesDir = path.resolve(
    __dirname,
    '../../../..',
    'test',
    'fixture',
    'cli',
    'buildMochapackOptions'
  )

  context('when no CLI arguments are provided', () => {
    context('when no Mocha config file is present', () => {
      it('returns all default options', () => {
        p = { argv: [] } as NodeJS.Process
        builtOptions = buildMochapackOptions(p)
        expect(builtOptions).to.eql(Mochapack.defaultOptions)
      })
    })
  })

  context('when CLI arguments are provided', () => {
    context('when no Mocha config file is present', () => {
      it('returns default options for .mochaOptions and uses CLI options for others', () => {
        p = { argv: ['', '', '--byom', 'path/to/byom.js'] } as NodeJS.Process
        builtOptions = buildMochapackOptions(p)
        expect(builtOptions).to.eql({
          ...Mochapack.defaultOptions,
          byomOptions: {
            path: 'path/to/byom.js'
          }
        })
      })
    })

    context('when a Mocha opts file is present', () => {
      const optsFile = path.resolve(fixturesDir, 'mocha.opts')

      it('returns opts file options for .mochaOptions', () => {
        p = {
          argv: ['', '', '--opts', optsFile]
        } as NodeJS.Process

        builtOptions = buildMochapackOptions(p)

        const expectedMochaOptions = { opts: optsFile, ui: 'tdd' }

        expectPartialMatch(builtOptions.mochaOptions, expectedMochaOptions)
      })

      it('prefers CLI arguments to opts file options', () => {
        p = {
          argv: ['', '', '--opts', optsFile, '--ui', 'exports']
        } as NodeJS.Process

        builtOptions = buildMochapackOptions(p)

        const expectedMochaOptions = {
          opts: optsFile,
          ui: 'exports'
        }

        expectPartialMatch(builtOptions.mochaOptions, expectedMochaOptions)
      })
    })

    context('when a Mocha config file is present', () => {
      const configExtensions = ['js', 'yaml', 'yml', 'jsonc', 'json']

      configExtensions.forEach(extension => {
        const configFile = path.resolve(fixturesDir, `.mocharc.${extension}`)

        it(`returns config file (.${extension}) options for .mochaOptions`, () => {
          p = {
            argv: ['', '', '--config', configFile]
          } as NodeJS.Process

          builtOptions = buildMochapackOptions(p)

          const expectedMochaOptions = {
            config: configFile,
            ui: 'tdd'
          }

          expectPartialMatch(builtOptions.mochaOptions, expectedMochaOptions)
        })

        it(`prefers CLI arguments to config file (.${extension}) options`, () => {
          p = {
            argv: ['', '', '--config', configFile, '--ui', 'exports']
          } as NodeJS.Process

          builtOptions = buildMochapackOptions(p)

          const expectedMochaOptions = {
            config: configFile,
            ui: 'exports'
          }

          expectPartialMatch(builtOptions.mochaOptions, expectedMochaOptions)
        })
      })

      it('properly assigns Mochapack-specific settings', () => {
        const configFile = path.resolve(fixturesDir, '.mochapack.json')

        p = {
          argv: ['', '', '--config', configFile]
        } as NodeJS.Process

        builtOptions = buildMochapackOptions(p)

        const expectedMochapackOptions = {
          byom: 'path/to/byom.js',
          'byom-config': 'path/to/byom-config.js',
          'byom-option': ['custom', 'options'],
          'clear-terminal': true,
          include: ['some/file.ts', 'another/file.js'],
          interactive: true,
          mode: 'development',
          quiet: true,
          'webpack-config': 'path/to/webpack.config.js',
          'webpack-env': 'customEnv'
        }

        const expectedMochaOptions = {
          config: configFile,
          ui: 'tdd'
        }

        expectPartialMatch(builtOptions, expectedMochapackOptions)
        expectPartialMatch(builtOptions.mochaOptions, expectedMochaOptions)
        mochapackYargsOptionKeys.forEach(key => {
          expect(builtOptions.mochaOptions[key]).to.be.undefined
        })
      })
    })
  })
})
