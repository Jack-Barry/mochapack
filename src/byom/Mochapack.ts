import { MochaOptions } from 'mocha'
import { Configuration } from 'webpack'

type WebpackMode = 'development' | 'production'

interface ByomOptions {
  path: string
  args: string[]
}

export interface MochapackOptions {
  byomOptions?: ByomOptions
  clearTerminal?: boolean
  include?: string[]
  interactive?: boolean
  mochaOptions?: MochaOptions
  mode?: WebpackMode
  quiet?: boolean
  webpackConfig?: Configuration
  webpackEnv?: string
}
