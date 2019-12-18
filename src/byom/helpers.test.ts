import { expect } from 'chai'
import helpers from './helpers'

describe('camelizeKeys', () => {
  it('converts top-level keys in an object to camelCase', () => {
    const inputObj = {
      key: {
        'nested-kebab-key': 'valueA'
      },
      'kebab-key': 'valueB',
      snake_key: 'valueC'
    }

    expect(helpers.camelizeKeys(inputObj)).to.eql({
      key: { 'nested-kebab-key': 'valueA' },
      kebabKey: 'valueB',
      snakeKey: 'valueC'
    })
  })
})
