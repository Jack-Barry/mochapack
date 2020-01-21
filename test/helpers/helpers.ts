import { expect } from 'chai'

/**
 * Ensures that an object includes specified object properties if all other
 *   properties are irrelevant to the test
 *
 * @param testObject An object to check for partial match against
 * @param referenceObject An object with specified expected properties
 */
export const expectPartialMatch = (
  testObject: Object,
  referenceObject: Object
): void => {
  Object.entries(referenceObject).forEach(([key, value]) => {
    expect(testObject[key]).to.eql(value)
  })
}

export default { expectPartialMatch }
