import { ParameterTypeRegistry, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { buildSuggestionsFromRegularExpression } from '../../src/suggestions/buildSuggestionsFromRegularExpression.js'
import { Suggestion } from '../../src/suggestions/types.js'

describe('buildSuggestionsFromRegularExpression', () => {
  let registry: ParameterTypeRegistry
  beforeEach(() => {
    registry = new ParameterTypeRegistry()
  })

  it('builds suggestions from a plain expression', () => {
    const expression = new RegularExpression(/I have 4 cukes/, registry)
    const expected: Suggestion = {
      segments: ['I have 4 cukes'],
      label: 'I have 4 cukes',
      matched: true,
    }
    const actual = buildSuggestionsFromRegularExpression(
      expression,
      registry,
      ['I have 4 cukes'],
      {}
    )
    assert.deepStrictEqual(actual, [expected])
  })

  it('builds suggestions from an expression with a group', () => {
    const expression = new RegularExpression(/I have (\d+) cukes/, registry)
    const expected: Suggestion = {
      segments: ['I have ', ['12'], ' cukes'],
      label: 'I have (\\d+) cukes',
      matched: true,
    }
    const actual = buildSuggestionsFromRegularExpression(expression, registry, ['I have 4 cukes'], {
      '-?\\d+|\\d+': ['12'],
    })
    assert.deepStrictEqual(actual, [expected])
  })

  it('builds suggestions for regexp without choices', () => {
    const expression = new RegularExpression(/^the price of a "(.*?)" is (\d+)c$/, registry)
    const expected: Suggestion = {
      segments: ['the price of a "', ['...'], '" is ', ['...'], 'c'],
      label: '^the price of a "(.*?)" is (\\d+)c$',
      matched: true,
    }
    const actual = buildSuggestionsFromRegularExpression(
      expression,
      registry,
      ['the price of a "lemon" is 34c'],
      {}
    )
    assert.deepStrictEqual(actual, [expected])
  })
})
