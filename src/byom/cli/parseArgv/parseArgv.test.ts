import { expect } from 'chai'
import { itParses } from '../../../../test/helpers/parseArgvHelpers'
import parseArgv from '.'

describe('parseArgv', () => {
  context('encountering duplicated arguments', () => {
    it('should throw for non array arguments', () => {
      const argv = [
        '--webpack-config',
        'webpack-config.js',
        '--webpack-config',
        'webpack-config2.js'
      ]

      expect(() => {
        parseArgv(argv)
      }).to.throw()
    })

    it('should not throw for array arguments', () => {
      const argv = ['--include', 'file1.js', '--include', 'file2.js']

      expect(() => {
        parseArgv(argv)
      }).not.to.throw()
    })
  })
  ;[true, false].forEach(bool => {
    context(`when ignoreDefaults=${bool}`, () => {
      it(`${bool ? 'ignores' : 'uses'} default options`, () => {
        if (bool) {
          expect(parseArgv([], bool)).to.eql({})
          expect(parseArgv([], bool)).to.be.empty
        } else {
          expect(parseArgv([], bool)).not.to.be.empty
          expect(parseArgv([], bool).clearTerminal).to.eq(false)
        }
      })

      context('when encountering options without values & file', () => {
        it('parses files correctly', () => {
          const argv = ['--clear-terminal', 'test/bin/fixture']
          const parsed = parseArgv(argv, bool)

          expect(parsed.files).to.eql(['test/bin/fixture'])
        })
      })

      context('when encountering options with values & file', () => {
        it('parses files correctly', () => {
          const argv = [
            '--webpack-config',
            'webpack-config.js',
            'test/bin/fixture'
          ]
          const parsed = parseArgv(argv, bool)

          expect(parsed.files).to.eql(['test/bin/fixture'])
        })
      })
    })
  })

  context('when no test file paths are provided', () => {
    it('uses "./test" as default for files', () => {
      const parsed = parseArgv([], false)

      expect(parsed.files).to.eql(['./test'])
    })
  })

  context('when encountering non-options', () => {
    context('when one non-option is present', () => {
      it('parses the non-option as the test file path', () => {
        const argv = ['./path/to/tests']
        const parsed = parseArgv(argv)

        expect(parsed.files).to.eql(['./path/to/tests'])
      })
    })

    context('when multiple non-options are present', () => {
      it('parses non-options as multiple test file paths', () => {
        const argv = ['./path/to/tests', './path/to/tests2']
        const parsed = parseArgv(argv)

        expect(parsed.files).to.eql(['./path/to/tests', './path/to/tests2'])
      })
    })
  })

  context('encountering options', () => {
    context('for Mochapack', () => {
      context('byom', () => {
        const parameters = [
          {
            given: ['--byom', 'path/to/byom.js'],
            expected: { path: 'path/to/byom.js' }
          }
        ]

        itParses(parameters, 'byomOptions')
      })

      context('byom-config', () => {
        const parameters = [
          {
            given: [
              '--byom',
              'path/to/byom.js',
              '--byom-config',
              'path/to/config.json'
            ],
            expected: {
              configPath: 'path/to/config.json',
              path: 'path/to/byom.js'
            }
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
      // Waiting for https://github.com/mochajs/mocha/pull/4122
      // Will test with one or two flags, doesn't need to be extensive
      const fixturePath = 'test/fixture/cli/parseArgv/.mocharc'
      context('config', () => {
        const parameters = [
          {
            given: ['--config', `${fixturePath}.js`],
            expected: { config: `${fixturePath}.js` }
          },
          {
            given: ['--config', `${fixturePath}.yaml`],
            expected: { config: `${fixturePath}.yaml` }
          }
        ]

        itParses(parameters, 'mochaOptions')
      })
    })

    context('for BYOM', () => {
      context('when byom is not defined', () => {
        const parameterSets = [
          {
            description: 'option by itself',
            params: ['--byom-option', 'unknown']
          },
          {
            description: 'option after known boolean',
            params: ['--clear-terminal', '--byom-option', 'unknown']
          },
          {
            description: 'option after known string',
            params: ['--include', 'test', '--byom-option', 'unknown']
          },
          {
            description: 'config by itself',
            params: ['--byom-config', 'config.json']
          },
          {
            description: 'config after known boolean',
            params: ['--clear-terminal', '--byom-config', 'config.json']
          },
          {
            description: 'config after known string',
            params: ['--include', 'test', '--byom-config', 'config.json']
          }
        ]

        parameterSets.forEach(paramSet => {
          it(`throws an error for byom ${paramSet.description}`, () => {
            expect(() => {
              parseArgv(paramSet.params)
            }).to.throw()
          })
        })
      })

      context('when byom is defined', () => {
        const parameters = [
          {
            given: ['--byom', 'byom.js', '--byom-option', 'unknown'],
            expected: { args: ['unknown'], path: 'byom.js' }
          },
          {
            given: [
              '--byom',
              'byom.js',
              '--byom-option',
              '"--unknown"',
              '--byom-option',
              'unknown-value'
            ],
            expected: {
              path: 'byom.js',
              args: ['--unknown', 'unknown-value']
            }
          }
        ]

        itParses(parameters, 'byomOptions')
      })
    })
  })
})
