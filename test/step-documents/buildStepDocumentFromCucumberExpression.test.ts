import { CucumberExpression, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { buildStepDocumentFromCucumberExpression } from '../../src/step-documents/buildStepDocumentFromCucumberExpression.js'
import { StepDocument } from '../../src/step-documents/types.js'

describe('buildStepDocumentFromCucumberExpression', () => {
  let registry: ParameterTypeRegistry
  beforeEach(() => {
    registry = new ParameterTypeRegistry()
  })

  it('builds an item from plain expression', () => {
    const expression = new CucumberExpression('I have 4 cukes', registry)
    const expected: StepDocument = {
      segments: ['I have 4 cukes'],
      suggestion: 'I have 4 cukes',
    }
    const actual = buildStepDocumentFromCucumberExpression(expression, registry)
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from alternate expression', () => {
    const expression = new CucumberExpression('I have 4/5 cukes', registry)
    const expected: StepDocument = {
      segments: ['I have ', ['4', '5'], ' cukes'],
      suggestion: 'I have 4/5 cukes',
    }
    const actual = buildStepDocumentFromCucumberExpression(expression, registry)
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from optional expression', () => {
    const expression = new CucumberExpression('I have 1 cuke(s)', registry)
    const expected: StepDocument = {
      segments: ['I have 1 cuke', ['s', '']],
      suggestion: 'I have 1 cuke(s)',
    }
    const actual = buildStepDocumentFromCucumberExpression(expression, registry)
    assert.deepStrictEqual(actual, expected)
  })
})
