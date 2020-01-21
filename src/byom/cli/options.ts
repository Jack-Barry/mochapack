import { Options } from 'yargs'
import Mochapack from '../Mochapack'
import { baseMochapackMochaYargsOptions } from './mochaOptions'

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
type YargsOptions<T extends string> = { [key in T]: Options }
export type MochapackYargsOptions = YargsOptions<MochapackYargsOptionKey>

export const MOCHAPACK_GROUP = 'Mochapack Options:'
export const BYOM_GROUP = 'B.Y.O.M. Options:'

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
    describe: 'Clear current terminal and purge its history',
    type: 'boolean',
    default: Mochapack.defaultOptions.clearTerminal
  },
  include: {
    describe: 'Include the provided module in test bundle',
    type: 'array',
    requiresArg: true
  },
  interactive: {
    describe: 'Force interactive mode (defaults to enabled in terminal)',
    type: 'boolean',
    default: Mochapack.defaultOptions.interactive
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
    default: Mochapack.defaultOptions.webpackConfig
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

  return { ...options, ...baseMochapackMochaYargsOptions() }
}
