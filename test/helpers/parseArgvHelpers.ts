import { expect } from 'chai'
import parseArgv from '../../src/byom/cli/parseArgv'
import { MochapackOptions } from '../../src/byom/Mochapack'

type ParsableParameter = {
  given: string[]
  expected: string | boolean | object
}

/**
 * Iterates over an array of given/expectation objects and ensures that the
 *   parser sets option values as expected
 *
 * @param parameters Array of given argv arrays and what value to expect from
 *   them for the given `key`
 * @param key The key on output of `parseArgv` that is expected to be set
 */
export const itParses = (
  parameters: ParsableParameter[],
  key: keyof MochapackOptions
): void => {
  parameters.forEach(param => {
    it(`parses ${param.given.join(' ')}`, () => {
      const parsed = parseArgv(param.given)

      expect(parsed[key]).to.eql(param.expected)
    })
  })
}

export default {
  itParses
}
