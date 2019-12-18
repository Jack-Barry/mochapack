import { Options } from 'yargs'

export const MOCHAPACK_GROUP = 'Mochapack Options:'
export const BYOM_GROUP = 'B.Y.O.M. Options:'

export const mochapackYargsOptionKeys = <const>[
  'byom',
  'byom-config',
  'byom-option',
  'clear-terminal',
  'include',
  'mode',
  'interactive',
  'quiet',
  'webpack-config',
  'webpack-env'
]

export type MochapackYargsOptionKey = typeof mochapackYargsOptionKeys[number]
export type MochapackYargsOptions = {
  [key in MochapackYargsOptionKey]: Options
}

export const baseMochapackYargsOptions = (): MochapackYargsOptions => ({
  byom: {
    describe: 'Path to your custom Mocha initializer',
    type: 'string',
    requiresArg: true
  },
  'byom-config': {
    describe: 'Path to config to provide to your custom Mocha initializer',
    type: 'string',
    requiresArg: true
  },
  'byom-option': {
    describe: 'Option to provide to your custom Mocha initializer',
    type: 'array',
    requiresArg: true
  },
  'clear-terminal': {
    describe: 'Clear current terminal and purge its histroy',
    type: 'boolean',
    default: false
  },
  include: {
    describe: 'Include the provided module in test bundle',
    type: 'array',
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
})

export const mochapackYargsOptions = (): MochapackYargsOptions => {
  const options = baseMochapackYargsOptions()

  Object.keys(options).forEach(key => {
    options[key].group = !key.includes('byom') ? MOCHAPACK_GROUP : BYOM_GROUP
  })

  return options
}
