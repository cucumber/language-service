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
      ['The nice song', 'The big boat'],
      [e1, e2],
      [
        {
          label: 'The {word} boat',
          segments: ['The ', ['big', 'nice'], ' boat'],
        },
        {
          label: 'The {word} song',
          segments: ['The ', ['big', 'nice'], ' song'],
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
      [
        'I have 42 cukes in my belly',
        'I have 54 cukes on my table',
        'I have 54 cukes in my basket',
      ],
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
      ['I have 42 cukes in my "belly"', 'I have 54 cukes in my "suitcase"'],
      [expression],
      [
        {
          label: 'I have (\\d\\d) cukes in my "(belly|suitcase)"',
          segments: ['I have ', ['42', '54'], ' cukes in my "', ['belly', 'suitcase'], '"'],
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
      [
        'I have 42 cukes in my belly',
        'I have 54 cukes on my table',
        'I have 67 cukes in my belly',
        'I have 54 cukes in my basket',
      ],
      [expression],
      [
        {
          label: 'I have {int} cukes in/on my {word}',
          segments: ['I have ', ['42', '54'], ' cukes ', ['in', 'on'], ' my ', ['basket', 'belly']],
        },
      ],
      2
    )
  })

  it('builds suggestions from unmatched step texts', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()

    assertSuggestions(
      parameterTypeRegistry,
      [
        'I have 42 cukes in my belly',
        'I have 54 cukes on my table',
        'I have 54 cukes in my basket',
      ],
      [],
      [
        {
          label: 'I have 42 cukes in my belly',
          segments: ['I have 42 cukes in my belly'],
        },
        {
          label: 'I have 54 cukes in my basket',
          segments: ['I have 54 cukes in my basket'],
        },
        {
          label: 'I have 54 cukes on my table',
          segments: ['I have 54 cukes on my table'],
        },
      ]
    )
  })
})

function assertSuggestions(
  parameterTypeRegistry: ParameterTypeRegistry,
  stepTexts: readonly string[],
  expressions: readonly Expression[],
  expectedSuggestions: Suggestion[],
  maxChoices = 10
) {
  const suggestions = buildSuggestions(parameterTypeRegistry, stepTexts, expressions, maxChoices)
  assert.deepStrictEqual(suggestions, expectedSuggestions)
}
