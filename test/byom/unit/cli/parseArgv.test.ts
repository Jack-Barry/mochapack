/* eslint-env node, mocha */
import { itParses } from '../../helpers/parseArgvHelpers'

describe('parseArgv', () => {
  context('encountering duplicated arguments', () => {
    xit('should throw for non arrays', () => {})

    xit('should not throw for arrays', () => {})
  })

  context('when ignore=true', () => {
    xit('ignores default options', () => {})

    context('when encountering options without values & file', () => {
      xit('parses files correctly')
    })

    context('when encountering options with values & file', () => {
      xit('parses files correctly')
    })
  })

  context('when ignore=false', () => {
    xit('uses default options', () => {})

    context('when encountering options without values & file', () => {
      xit('parses files correctly')
    })

    context('when encountering options with values & file', () => {
      xit('parses files correctly')
    })
  })

  context('when no test file paths are provided', () => {
    xit('uses "./test" as default for files', () => {})
  })

  context('when encountering non-options', () => {
    context('when one non-option is present', () => {
      xit('parses the non-option as the test file path', () => {})
    })

    context('when multiple non-options are present', () => {
      xit('parses non-options as multiple test file paths', () => {})
    })
  })

  context('encountering options', () => {
    context('for Mochapack', () => {
      context('byom', () => {
        const parameters = [
          {
            given: ['--byom', 'path/to/byom.js'],
            expected: { byomOptions: { path: 'path/to/byom.js' } }
          }
        ]

        itParses(parameters, 'byomOptions')
      })

      context('clear-terminal', () => {
        const parameters = [
          {
            given: ['--clear-terminal'],
            expected: true
          }
        ]

        itParses(parameters, 'clearTerminal')
      })

      context('include', () => {
        const parameters = [
          { given: ['--include', 'test'], expected: ['test'] },
          {
            given: ['--include', 'test', '--include', 'test2'],
            expected: ['test', 'test2']
          }
        ]

        itParses(parameters, 'include')
      })

      context('interactive', () => {
        const parameters = [{ given: ['--interactive'], expected: true }]

        itParses(parameters, 'interactive')
      })

      context('mode', () => {
        const parameters = [
          { given: ['--mode', 'development'], expected: 'development' },
          { given: ['--mode', 'production'], expected: 'production' }
        ]

        itParses(parameters, 'mode')
      })

      context('quiet', () => {
        const parameters = [
          { given: ['--quiet'], expected: true },
          { given: ['--q'], expected: true },
          { given: ['-q'], expected: true }
        ]

        itParses(parameters, 'quiet')
      })

      context('webpack-config', () => {
        const parameters = [
          {
            given: ['--webpack-config', 'webpack-config.js'],
            expected: 'webpack-config.js'
          }
        ]

        itParses(parameters, 'webpackConfig')
      })

      context('webpack-env', () => {
        const parameters = [
          { given: ['--webpack-env', 'production'], expected: 'production' },
          {
            given: ['--webpack-env.env', 'production'],
            expected: { env: 'production' }
          },
          {
            given: ['--webpack-env.anotherEnv', 'test'],
            expected: { anotherEnv: 'test' }
          },
          {
            given: [
              '--webpack-env.env',
              'production',
              '--webpack-env.anotherEnv',
              'test'
            ],
            expected: { env: 'production', anotherEnv: 'test' }
          }
        ]

        itParses(parameters, 'webpackEnv')
      })
    })

    context('for Mocha', () => {
      xit('funnels them to .mochaOptions', () => {})
    })

    context('when unrecognized', () => {
      context('when byom is not defined', () => {
        xit('throws an error', () => {})
      })

      context('when byom is defined', () => {
        xit('funnels the array to .byomOptions', () => {})
      })
    })
  })
})
