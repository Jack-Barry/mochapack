import yargs, { Argv } from 'yargs'
import { pick as _pick, omit as _omit } from 'lodash'
import {
  mochapackYargsOptions,
  MochapackYargsOptionKey,
  MochapackYargsOptions
} from './options'
import Mochapack, { ByomOptions, MochapackOptions } from '../Mochapack'
import { camelizeKeys } from '../helpers'

/**
 * Removes default values from the options available to Yargs
 */
const removeDefaults = (
  options: MochapackYargsOptions
): MochapackYargsOptions => {
  const filteredOptions = {}

  Object.keys(options).forEach(key => {
    filteredOptions[key] = _omit(options[key], 'default')
  })

  return filteredOptions as MochapackYargsOptions
}

/**
 * Returns the output of pre-configured Yargs function
 *
 * @param argv Array of arguments to parse
 * @param ignoreDefaults Whether or not to ignore defaults configured in options
 */
const parseWithYargs = (argv: string[], ignoreDefaults: boolean) => {
  let options = mochapackYargsOptions()
  if (ignoreDefaults) options = removeDefaults(options)

  const yargsOutput = ((yargs() as unknown) as Argv<{}>)
    .options(options)
    .help('help')
    .alias('help', 'h')
    .version()
    .strict()
    .parse(argv)

  return yargsOutput
}

type MochapackYargsOutput = ReturnType<typeof parseWithYargs>
type MochapackKeysYargsOutput = {
  [key in MochapackYargsOptionKey]: MochapackYargsOutput[string]
}

/**
 * Filters the output from Yargs to only include Mochapack specific keys
 *
 * @param parsedArgs Raw output from Yargs
 */
const mochapackParsedArgs = (
  parsedArgs: MochapackYargsOutput
): MochapackKeysYargsOutput => {
  const mochapackKeys = Object.keys(mochapackYargsOptions())
  return _pick(parsedArgs, mochapackKeys) as MochapackKeysYargsOutput
}

/**
 * Checks if any keys other than those with the `array` type have been set
 *   multiple times
 *
 * @param output Output from Yargs filtered by Mochapack specific arguments
 */
const preventDuplicates = (output: MochapackKeysYargsOutput): void => {
  Object.keys(output).forEach(key => {
    const multipleAllowed = mochapackYargsOptions()[key]?.type === 'array'
    const multiplePresent = output[key] instanceof Array

    if (!multipleAllowed && multiplePresent) {
      throw new Error(
        `Duplicating arguments for ${key}" is not allowed. "${output[key]}" was provided, but expected "${output[key][0]}"`
      )
    }
  })
}

/**
 * Ensures that BYOM options are not passed without a value for the BYOM path
 *
 * @param output Output from Yargs filtered by Mochapack specific arguments
 */
const validateByomArgs = (output: MochapackKeysYargsOutput): void => {
  if (!output.byom && (output['byom-config'] || output['byom-option'])) {
    throw new Error(
      `Providing options for BYOM without setting path is prohibited. Use --byom to set a path to your BYOM module file.`
    )
  }
}

/**
 * Builds an object to assign to byomOptions
 *
 * @param output Output from Yargs filtered by Mochapack specific arguments
 */
const buildByomOptions = (output: MochapackKeysYargsOutput): ByomOptions => {
  const byomOptions: ByomOptions = { path: output.byom as string }
  if (output['byom-option'])
    byomOptions.args = output['byom-option'] as string[]
  if (output['byom-config'])
    byomOptions.configPath = output['byom-config'] as string
  return byomOptions
}

/**
 * Parses the arguments known to Mochapack to produce a MochapackOptions object
 *
 * @param argv Array of arguments to parse
 * @param ignoreDefaults Whether or not to use defaults for output objectyarg
 */
export const parseArgv = (
  argv: string[],
  ignoreDefaults: boolean = false
): MochapackOptions => {
  const yargsOutput = parseWithYargs(argv, ignoreDefaults)
  const mochapackYargs = mochapackParsedArgs(yargsOutput)

  preventDuplicates(mochapackYargs)
  validateByomArgs(mochapackYargs)

  const mochapackDefaults = Mochapack.defaultOptions
  const mochapackOptions: MochapackOptions = {}
  const files = yargsOutput._

  if (!ignoreDefaults) mochapackOptions.files = mochapackDefaults.files
  if (files.length) mochapackOptions.files = files

  const camelizedYargs = camelizeKeys(mochapackYargs)

  Object.entries(camelizedYargs).forEach(([key, value]) => {
    if (value && !key.includes('byom')) mochapackOptions[key] = value
    else if (!ignoreDefaults) mochapackOptions[key] = mochapackDefaults[key]
  })

  if (mochapackYargs.byom)
    mochapackOptions.byomOptions = buildByomOptions(mochapackYargs)

  return mochapackOptions
}

export default parseArgv
