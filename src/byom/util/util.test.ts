import { expect } from 'chai'
import util from '.'

describe('camelizeKeys', () => {
  it('converts top-level keys in an object to camelCase', () => {
    const inputObj = {
      key: {
        'nested-kebab-key': 'valueA'
      },
      'kebab-key': 'valueB',
      snake_key: 'valueC'
    }

    expect(util.camelizeKeys(inputObj)).to.eql({
      key: { 'nested-kebab-key': 'valueA' },
      kebabKey: 'valueB',
      snakeKey: 'valueC'
    })
  })
})
