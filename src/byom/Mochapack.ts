import { MochaOptions } from 'mocha'
import { Configuration } from 'webpack'

type WebpackMode = 'development' | 'production'

/**
 * Options used for Bring Your Own Mocha feature
 */
export interface ByomOptions {
  /** Arguments to be passed to and parsed by the custom Mocha initializer */
  args?: string[]
  /** Path to JSON or .js file with config for custom Mocha initializer */
  configPath?: string
  /** Path to file where the custom Mocha initializer is exported from */
  path: string
}

/** Options used to initiate an instance of Mochapack */
export interface MochapackOptions {
  /** Options for byom */
  byomOptions?: ByomOptions
  /** Whether or not to clear the terminal and purge its history */
  clearTerminal?: boolean
  /** File names or glob patterns to run tests from */
  files?: string[]
  /** Files to include in the test bundle */
  include?: string[]
  /** Whether or not interactive mode is enforced */
  interactive?: boolean
  /** Options to pass to the standard Mocha initializer */
  mochaOptions?: MochaOptions
  /** The Webpack mode to use */
  mode?: WebpackMode
  /** Whether or not to suppress informational messages from Mocha */
  quiet?: boolean
  /** Path to Webpack config to use */
  webpackConfig?: Configuration
  /** Environment to pass to Webpack config if it is a Function */
  webpackEnv?: string
}

export default class Mochapack {
  public static defaultOptions: MochapackOptions = {
    clearTerminal: false,
    files: ['./test'],
    interactive: false,
    mochaOptions: {},
    quiet: false,
    webpackConfig: {}
  }
}
