import {
  Expression,
  ExpressionFactory,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { buildStepDocuments } from '../../src/step-documents/buildStepDocuments.js'
import { StepDocument } from '../../src/step-documents/types.js'

describe('buildStepDocuments', () => {
  it('builds step documents from parameter step definition without steps', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const expression = ef.createExpression('I have {int} cukes')
    assertStepDocuments(
      parameterTypeRegistry,
      [],
      [expression],
      [
        {
          suggestion: 'I have {int} cukes',
          segments: ['I have ', [], ' cukes'],
          expression,
        },
      ]
    )
  })

  it('builds step documents from alternation step definition without steps', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const expression = ef.createExpression('I have two/three cukes')
    assertStepDocuments(
      parameterTypeRegistry,
      [],
      [expression],
      [
        {
          suggestion: 'I have two/three cukes',
          segments: ['I have ', ['two', 'three'], ' cukes'],
          expression,
        },
      ]
    )
  })

  it('builds step documents with global choices', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const e1 = ef.createExpression('The {word} song')
    const e2 = ef.createExpression('The {word} boat')

    assertStepDocuments(
      parameterTypeRegistry,
      ['The nice song', 'The big boat'],
      [e1, e2],
      [
        {
          suggestion: 'The {word} boat',
          segments: ['The ', ['big', 'nice'], ' boat'],
          expression: e2,
        },
        {
          suggestion: 'The {word} song',
          segments: ['The ', ['big', 'nice'], ' song'],
          expression: e1,
        },
      ]
    )
  })

  it('builds step documents from CucumberExpression', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const expression = ef.createExpression('I have {int} cukes in/on my {word}')
    assertStepDocuments(
      parameterTypeRegistry,
      [
        'I have 42 cukes in my belly',
        'I have 54 cukes on my table',
        'I have 54 cukes in my basket',
      ],
      [expression],
      [
        {
          suggestion: 'I have {int} cukes in my {word}',
          segments: ['I have ', ['42', '54'], ' cukes in my ', ['basket', 'belly', 'table']],
          expression,
        },
        {
          suggestion: 'I have {int} cukes on my {word}',
          segments: ['I have ', ['42', '54'], ' cukes on my ', ['basket', 'belly', 'table']],
          expression,
        },
      ]
    )
  })

  it('builds step documents from RegularExpression', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const expression = ef.createExpression(/I have (\d\d) cukes in my "(belly|suitcase)"/)
    assertStepDocuments(
      parameterTypeRegistry,
      ['I have 42 cukes in my "belly"', 'I have 54 cukes in my "suitcase"'],
      [expression],
      [
        {
          suggestion: 'I have {} cukes in my "{}"',
          segments: ['I have ', ['42', '54'], ' cukes in my "', ['belly', 'suitcase'], '"'],
          expression,
        },
      ]
    )
  })

  it('builds step documents with a max number of choices', () => {
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const ef = new ExpressionFactory(parameterTypeRegistry)
    const expression = ef.createExpression('I have {int} cukes in/on my {word}')
    assertStepDocuments(
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
          suggestion: 'I have {int} cukes in my {word}',
          segments: ['I have ', ['42', '54'], ' cukes in my ', ['basket', 'belly']],
          expression,
        },
        {
          suggestion: 'I have {int} cukes on my {word}',
          segments: ['I have ', ['42', '54'], ' cukes on my ', ['basket', 'belly']],
          expression,
        },
      ],
      2
    )
  })
})

function assertStepDocuments(
  parameterTypeRegistry: ParameterTypeRegistry,
  stepTexts: readonly string[],
  expressions: readonly Expression[],
  expectedStepDocuments: StepDocument[],
  maxChoices = 10
) {
  const stepDocuments = buildStepDocuments(
    parameterTypeRegistry,
    stepTexts,
    expressions,
    maxChoices
  )
  assert.deepStrictEqual(stepDocuments, expectedStepDocuments)
}
