import { expect } from 'chai'
import path from 'path'
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

describe('existsFileSync', () => {
  it('returns true if the file exists', () => {
    expect(util.existsFileSync(path.resolve(__dirname, 'index.ts'))).to.eq(true)
  })

  it('returns false if the file does not exist', () => {
    expect(util.existsFileSync(path.resolve(__dirname, 'fakefile.ts'))).to.eq(
      false
    )
  })
})
