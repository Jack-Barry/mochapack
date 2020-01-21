import { defaults as _defaults } from 'lodash'
import { MochaOptions } from 'mocha'
import { loadOptions } from 'mocha/lib/cli/options'
import { loadConfig } from 'mocha/lib/cli/config'

import Mochapack, { MochapackOptions } from '../../Mochapack'
import parseArgv from '../parseArgv'
import { mochapackYargsOptionKeys, MochapackYargsOptionKey } from '../options'

/**
 * Splits Mochapack-specific values into a separate object from
 *   non-Mochapack-specific values
 *
 * @param obj An object to split into Mochapack and non-Mochapack
 *   configurations
 */
const extractMochapackConfig = (
  obj: Object
): { mochapack: MochapackOptions; nonMochapack: Object } => {
  const mochapackConfig = {}
  const nonMochapackConfig = {}

  Object.entries(obj).forEach(([key, value]) => {
    if (mochapackYargsOptionKeys.includes(key as MochapackYargsOptionKey)) {
      mochapackConfig[key] = value
    } else {
      nonMochapackConfig[key] = value
    }
  })

  return {
    mochapack: mochapackConfig as MochapackOptions,
    nonMochapack: nonMochapackConfig
  }
}

/**
 * Parses arguments and Mocha config file then combines applicable options
 *
 * Prefers CLI options to config file options, and config file options to
 *   defaults
 *
 * @param p A NodeJS Process to parse arguments from
 */
const buildMochapackOptions = (p: NodeJS.Process): MochapackOptions => {
  const cliOptions = parseArgv(p.argv.slice(2), true)
  let configOptions: MochaOptions = Mochapack.defaultMochaOptions

  // @ts-ignore
  if (cliOptions.mochaOptions?.opts) {
    configOptions = loadOptions(p.argv)
  }

  if (cliOptions.mochaOptions?.config) {
    configOptions = loadConfig(cliOptions.mochaOptions.config)
  }

  const configs = extractMochapackConfig(configOptions)

  cliOptions.mochaOptions = _defaults(
    {},
    cliOptions.mochaOptions,
    configs.nonMochapack,
    Mochapack.defaultMochaOptions
  )

  return _defaults({}, cliOptions, configs.mochapack, Mochapack.defaultOptions)
}

export default buildMochapackOptions
