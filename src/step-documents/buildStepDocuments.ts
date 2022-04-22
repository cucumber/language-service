import {
  CucumberExpression,
  Expression,
  ParameterTypeRegistry,
  RegularExpression,
} from '@cucumber/cucumber-expressions'

import { buildStepDocumentFromCucumberExpression } from './buildStepDocumentFromCucumberExpression.js'
import { buildStepDocumentsFromRegularExpression } from './buildStepDocumentsFromRegularExpression.js'
import { makeKey } from './helpers.js'
import { StepDocument } from './types.js'

/**
 * Builds an array of {@link StepDocument} from steps and step definitions.
 *
 * @param parameterTypeRegistry
 * @param stepTexts
 * @param expressions
 * @param maxChoices
 */
export function buildStepDocuments(
  parameterTypeRegistry: ParameterTypeRegistry,
  stepTexts: readonly string[],
  expressions: readonly Expression[],
  maxChoices = 10
): readonly StepDocument[] {
  let stepDocuments: StepDocument[] = []

  const parameterChoiceSets: Record<string, Set<string>> = {}

  for (const expression of expressions) {
    for (const text of stepTexts) {
      const args = expression.match(text)
      if (args) {
        const parameterTypes = args.map((arg) => arg.getParameterType())
        for (let argIndex = 0; argIndex < args.length; argIndex++) {
          const arg = args[argIndex]
          const parameterType = parameterTypes[argIndex]
          const key = makeKey(parameterType)
          let choices = parameterChoiceSets[key]
          if (!choices) {
            parameterChoiceSets[key] = choices = new Set()
          }
          if (arg.group.value !== undefined) choices.add(arg.group.value)
        }
      }
    }
  }
  const parameterChoices = Object.fromEntries(
    Object.entries(parameterChoiceSets).map(([key, choices]) => [
      key,
      [...choices].sort().slice(0, maxChoices),
    ])
  )

  for (const expression of expressions) {
    if (expression instanceof CucumberExpression) {
      stepDocuments = stepDocuments.concat(
        buildStepDocumentFromCucumberExpression(expression, parameterTypeRegistry, parameterChoices)
      )
    }
    if (expression instanceof RegularExpression) {
      stepDocuments = stepDocuments.concat(
        buildStepDocumentsFromRegularExpression(
          expression,
          parameterTypeRegistry,
          stepTexts,
          parameterChoices
        )
      )
    }
  }
  return stepDocuments.sort((a, b) => a.suggestion.localeCompare(b.suggestion))
}
