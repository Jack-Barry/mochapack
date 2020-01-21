import { defaults as _defaults } from 'lodash'
import { MochaOptions } from 'mocha'
import { loadOptions } from 'mocha/lib/cli/options'
import { loadConfig } from 'mocha/lib/cli/config'

import Mochapack, { MochapackOptions } from '../../Mochapack'
import parseArgv from '../parseArgv'

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

  cliOptions.mochaOptions = _defaults(
    {},
    cliOptions.mochaOptions,
    configOptions,
    Mochapack.defaultMochaOptions
  )

  return _defaults({}, cliOptions, Mochapack.defaultOptions)
}

export default buildMochapackOptions
