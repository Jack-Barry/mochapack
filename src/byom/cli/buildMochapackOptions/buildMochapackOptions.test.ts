import { expect } from 'chai'
import buildMochapackOptions from '.'
import Mochapack from '../../Mochapack'

describe('buildMochapackOptions', () => {
  let p: NodeJS.Process

  context('when no CLI arguments are provided', () => {
    context('when no Mocha config file is present', () => {
      it('returns all default options', () => {
        p = { argv: [] } as NodeJS.Process
        expect(buildMochapackOptions(p)).to.eql(Mochapack.defaultOptions)
      })
    })

    xcontext('when a Mocha config file is present', () => {
      it('returns config file options for .mochaOptions and defaults for others', () => {})
    })
  })

  xcontext('when CLI arguments are provided', () => {
    context('when no Mocha config file is present', () => {
      it('returns default options for .mochaOptions and uses CLI options for others', () => {})
    })

    context('when a Mocha config file is present', () => {
      it('returns config file options for .mochaOptions and CLI options', () => {})

      it('prefers CLI arguments to config file options', () => {})
    })
  })
})
