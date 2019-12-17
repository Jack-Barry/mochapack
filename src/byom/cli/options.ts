import { Options } from 'yargs'

export const MOCHAPACK_GROUP = 'Mochapack Options:'

const mochapackYargsOptionKeys = <const>[
  'byom',
  'clear-terminal',
  'include',
  'mode',
  'interactive',
  'quiet',
  'webpack-config',
  'webpack-env'
]

export type MochapackYargsOptionKey = typeof mochapackYargsOptionKeys[number]
type MochapackYargsOptions = { [key in MochapackYargsOptionKey]: Options }

export const baseMochapackyargsOptions: MochapackYargsOptions = {
  byom: {
    describe: 'Path to your custom Mocha initializer',
    type: 'string',
    requiresArg: true,
    default: undefined
  },
  'clear-terminal': {
    describe: 'Clear current terminal and purge its histroy',
    type: 'boolean',
    default: false
  },
  include: {
    describe: 'Include the provided module in test bundle',
    type: 'string',
    requiresArg: true
  },
  interactive: {
    describe: 'Force interactive mode (defaults to enabled in terminal)',
    type: 'boolean',
    default: !!process.stdout.isTTY
  },
  mode: {
    describe: 'Webpack mode to use',
    type: 'string',
    choices: ['development', 'production'],
    requiresArg: true
  },
  quiet: {
    describe: 'Suppress informational messages',
    type: 'boolean',
    default: undefined,
    alias: 'q'
  },
  'webpack-config': {
    describe: 'Path to Webpack config file',
    type: 'string',
    requiresArg: true,
    default: 'webpack.config.js'
  },
  'webpack-env': {
    describe: 'Environment passed to Webpack config when it is a function',
    type: 'string',
    requiresArg: true
  }
}

export const mochapackYargsOptions = (): MochapackYargsOptions => {
  const options = baseMochapackyargsOptions

  Object.keys(options).forEach(key => {
    options[key].group = MOCHAPACK_GROUP
  })

  return options
}
