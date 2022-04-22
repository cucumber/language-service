import { ParameterTypeRegistry, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { buildStepDocumentsFromRegularExpression } from '../../src/step-documents/buildStepDocumentsFromRegularExpression.js'
import { StepDocument } from '../../src/step-documents/types.js'

describe('buildStepDocumentsFromRegularExpression', () => {
  let registry: ParameterTypeRegistry
  beforeEach(() => {
    registry = new ParameterTypeRegistry()
  })

  it('builds an item from a plain expression', () => {
    const expression = new RegularExpression(/I have 4 cukes/, registry)
    const expected: StepDocument = {
      segments: ['I have 4 cukes'],
      suggestion: 'I have 4 cukes',
    }
    const actual = buildStepDocumentsFromRegularExpression(
      expression,
      registry,
      ['I have 4 cukes'],
      {}
    )
    assert.deepStrictEqual(actual, [expected])
  })

  it('builds an item from an expression with a group', () => {
    const expression = new RegularExpression(/I have (\d+) cukes/, registry)
    const expected: StepDocument = {
      segments: ['I have ', ['12'], ' cukes'],
      suggestion: 'I have (\\d+) cukes',
    }
    const actual = buildStepDocumentsFromRegularExpression(
      expression,
      registry,
      ['I have 4 cukes'],
      { '-?\\d+|\\d+': ['12'] }
    )
    assert.deepStrictEqual(actual, [expected])
  })
})
