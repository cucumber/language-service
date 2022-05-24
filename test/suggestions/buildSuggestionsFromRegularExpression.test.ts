import { ParameterTypeRegistry, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { buildSuggestionsFromRegularExpression } from '../../src/suggestions/buildSuggestionsFromRegularExpression.js'
import { Suggestion } from '../../src/suggestions/types.js'

describe('buildSuggestionsFromRegularExpression', () => {
  let registry: ParameterTypeRegistry
  beforeEach(() => {
    registry = new ParameterTypeRegistry()
  })

  it('builds an item from a plain expression', () => {
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

  it('builds an item from an expression with a group', () => {
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
})
