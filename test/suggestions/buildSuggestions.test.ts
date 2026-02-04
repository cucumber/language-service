import {
  Expression,
  ExpressionFactory,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { buildSuggestions } from '../../src/suggestions/buildSuggestions.js'
import { Suggestion } from '../../src/suggestions/types.js'

describe('buildSuggestions', () => {
  it('builds suggestions with choices', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const e1 = ef.createExpression('The {word} song')
    const e2 = ef.createExpression('The {word} boat')

    assertSuggestions(
      parameterTypeRegistry,
      new Set(['The nice song', 'The big boat']),
      [e1, e2],
      [
        {
          label: 'The {word} boat',
          segments: ['The ', ['big', 'nice'], ' boat'],
          matched: true,
        },
        {
          label: 'The {word} song',
          segments: ['The ', ['big', 'nice'], ' song'],
          matched: true,
        },
      ]
    )
  })

  it('builds suggestions from CucumberExpression', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const expression = ef.createExpression('I have {int} cukes in/on my {word}')
    assertSuggestions(
      parameterTypeRegistry,
      new Set([
        'I have 42 cukes in my belly',
        'I have 54 cukes on my table',
        'I have 54 cukes in my basket',
      ]),
      [expression],
      [
        {
          label: 'I have {int} cukes in/on my {word}',
          segments: [
            'I have ',
            ['42', '54'],
            ' cukes ',
            ['in', 'on'],
            ' my ',
            ['basket', 'belly', 'table'],
          ],
          matched: true,
        },
      ]
    )
  })

  it('builds suggestions from RegularExpression', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const expression = ef.createExpression(/I have (\d\d) cukes in my "(belly|suitcase)"/)
    assertSuggestions(
      parameterTypeRegistry,
      new Set(['I have 42 cukes in my "belly"', 'I have 54 cukes in my "suitcase"']),
      [expression],
      [
        {
          label: 'I have (\\d\\d) cukes in my "(belly|suitcase)"',
          segments: ['I have ', ['42', '54'], ' cukes in my "', ['belly', 'suitcase'], '"'],
          matched: true,
        },
      ]
    )
  })

  it('builds suggestions from another RegularExpression', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const expression = ef.createExpression(/^the price of a "(.*?)" is (\d+)c$/)
    assertSuggestions(
      parameterTypeRegistry,
      new Set(['the price of a "lemon" is 34c', 'the price of a "pear" is 48c']),
      [expression],
      [
        {
          label: '^the price of a "(.*?)" is (\\d+)c$',
          segments: ['the price of a "', ['lemon', 'pear'], '" is ', ['...'], 'c'],
          matched: true,
        },
      ]
    )
  })

  it('builds suggestions with a max number of choices', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const expression = ef.createExpression('I have {int} cukes in/on my {word}')
    assertSuggestions(
      parameterTypeRegistry,
      new Set([
        'I have 42 cukes in my belly',
        'I have 54 cukes on my table',
        'I have 67 cukes in my belly',
        'I have 54 cukes in my basket',
      ]),
      [expression],
      [
        {
          label: 'I have {int} cukes in/on my {word}',
          segments: ['I have ', ['42', '54'], ' cukes ', ['in', 'on'], ' my ', ['basket', 'belly']],
          matched: true,
        },
      ],
      2
    )
  })

  it('builds suggestions from unmatched step texts', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()

    assertSuggestions(
      parameterTypeRegistry,
      new Set([
        'I have 42 cukes in my belly',
        'I have 54 cukes on my table',
        'I have 54 cukes in my basket',
      ]),
      [],
      [
        {
          label: 'I have 42 cukes in my belly',
          segments: ['I have 42 cukes in my belly'],
          matched: false,
        },
        {
          label: 'I have 54 cukes in my basket',
          segments: ['I have 54 cukes in my basket'],
          matched: false,
        },
        {
          label: 'I have 54 cukes on my table',
          segments: ['I have 54 cukes on my table'],
          matched: false,
        },
      ]
    )
  })
})

function assertSuggestions(
  parameterTypeRegistry: ParameterTypeRegistry,
  stepTexts: Set<string>,
  expressions: readonly Expression[],
  expectedSuggestions: Suggestion[],
  maxChoices = 10
) {
  const suggestions = buildSuggestions(parameterTypeRegistry, stepTexts, expressions, maxChoices)
  assert.deepStrictEqual(suggestions, expectedSuggestions)
}
