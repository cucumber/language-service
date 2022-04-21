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
    const actual = buildStepDocumentFromCucumberExpression(expression, registry, {})
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from alternation expression', () => {
    const expression = new CucumberExpression('I have 4/5 cukes', registry)
    const expected: StepDocument = {
      segments: ['I have ', ['4', '5'], ' cukes'],
      suggestion: 'I have 4/5 cukes',
    }
    const actual = buildStepDocumentFromCucumberExpression(expression, registry, {})
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from optional expression', () => {
    const expression = new CucumberExpression('I have 1 cuke(s)', registry)
    const expected: StepDocument = {
      segments: ['I have 1 cuke', ['s', '']],
      suggestion: 'I have 1 cuke(s)',
    }
    const actual = buildStepDocumentFromCucumberExpression(expression, registry, {})
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from parameter expression with explicit options', () => {
    const expression = new CucumberExpression('I have {int} cukes', registry)
    const expected: StepDocument = {
      segments: ['I have ', ['12', '17'], ' cukes'],
      suggestion: 'I have {int} cukes',
    }
    const actual = buildStepDocumentFromCucumberExpression(expression, registry, {
      int: ['12', '17'],
    })
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from int parameter expression without explicit options', () => {
    const expression = new CucumberExpression('I have {int} cukes', registry)
    const expected: StepDocument = {
      segments: ['I have ', ['0'], ' cukes'],
      suggestion: 'I have {int} cukes',
    }
    const actual = buildStepDocumentFromCucumberExpression(expression, registry, {})
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from only alternation expression', () => {
    const expression = new CucumberExpression('me/you', registry)
    const expected: StepDocument = {
      segments: [['me', 'you']],
      suggestion: 'me/you',
    }
    const actual = buildStepDocumentFromCucumberExpression(expression, registry, {})
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from complex expression', () => {
    const expression = new CucumberExpression('I have {int} cuke(s) in my bag/belly', registry)
    const expected: StepDocument = {
      segments: ['I have ', ['12'], ' cuke', ['s', ''], ' in my ', ['bag', 'belly']],
      suggestion: 'I have {int} cuke(s) in my bag/belly',
    }
    const actual = buildStepDocumentFromCucumberExpression(expression, registry, {
      int: ['12'],
    })
    assert.deepStrictEqual(actual, expected)
  })
})
