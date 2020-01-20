import { defaults as _defaults } from 'lodash'

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

  return _defaults({}, cliOptions, Mochapack.defaultOptions)
}

export default buildMochapackOptions
