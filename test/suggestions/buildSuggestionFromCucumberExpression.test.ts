import { CucumberExpression, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { buildSuggestionFromCucumberExpression } from '../../src/suggestions/buildSuggestionFromCucumberExpression.js'
import { Suggestion } from '../../src/suggestions/types.js'

describe('buildSuggestionFromCucumberExpression', () => {
  let registry: ParameterTypeRegistry
  beforeEach(() => {
    registry = new ParameterTypeRegistry()
  })

  it('builds an item from plain expression', () => {
    const expression = new CucumberExpression('I have 4 cukes', registry)
    const expected: Suggestion = {
      segments: ['I have 4 cukes'],
      label: 'I have 4 cukes',
    }
    const actual = buildSuggestionFromCucumberExpression(expression, registry, {})
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from alternation expression', () => {
    const expression = new CucumberExpression('I have 4/5 cukes', registry)
    const expected: Suggestion = {
      segments: ['I have ', ['4', '5'], ' cukes'],
      label: 'I have 4/5 cukes',
    }
    const actual = buildSuggestionFromCucumberExpression(expression, registry, {})
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from optional expression', () => {
    const expression = new CucumberExpression('I have 1 cuke(s)', registry)
    const expected: Suggestion = {
      segments: ['I have 1 cuke', ['s', '']],
      label: 'I have 1 cuke(s)',
    }
    const actual = buildSuggestionFromCucumberExpression(expression, registry, {})
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from parameter expression with explicit options', () => {
    const expression = new CucumberExpression('I have {int} cukes', registry)
    const expected: Suggestion = {
      segments: ['I have ', ['12', '17'], ' cukes'],
      label: 'I have {int} cukes',
    }
    const actual = buildSuggestionFromCucumberExpression(expression, registry, {
      int: ['12', '17'],
    })
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from int parameter expression without explicit options', () => {
    const expression = new CucumberExpression('I have {int} cukes', registry)
    const expected: Suggestion = {
      segments: ['I have ', ['0'], ' cukes'],
      label: 'I have {int} cukes',
    }
    const actual = buildSuggestionFromCucumberExpression(expression, registry, {})
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from only alternation expression', () => {
    const expression = new CucumberExpression('me/you', registry)
    const expected: Suggestion = {
      segments: [['me', 'you']],
      label: 'me/you',
    }
    const actual = buildSuggestionFromCucumberExpression(expression, registry, {})
    assert.deepStrictEqual(actual, expected)
  })

  it('builds an item from complex expression', () => {
    const expression = new CucumberExpression('I have {int} cuke(s) in my bag/belly', registry)
    const expected: Suggestion = {
      segments: ['I have ', ['12'], ' cuke', ['s', ''], ' in my ', ['bag', 'belly']],
      label: 'I have {int} cuke(s) in my bag/belly',
    }
    const actual = buildSuggestionFromCucumberExpression(expression, registry, {
      int: ['12'],
    })
    assert.deepStrictEqual(actual, expected)
  })
})
