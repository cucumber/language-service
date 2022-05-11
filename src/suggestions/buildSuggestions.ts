import {
  CucumberExpression,
  Expression,
  ParameterTypeRegistry,
  RegularExpression,
} from '@cucumber/cucumber-expressions'

import { buildSuggestionFromCucumberExpression } from './buildSuggestionFromCucumberExpression.js'
import { buildSuggestionsFromRegularExpression } from './buildSuggestionsFromRegularExpression.js'
import { makeKey } from './helpers.js'
import { Suggestion } from './types.js'

/**
 * Builds an array of {@link Suggestion} from steps and step definitions.
 *
 * @param registry
 * @param stepTexts
 * @param expressions
 * @param maxChoices
 */
export function buildSuggestions(
  registry: ParameterTypeRegistry,
  stepTexts: readonly string[],
  expressions: readonly Expression[],
  maxChoices = 10
): readonly Suggestion[] {
  let suggestions: Suggestion[] = []

  const parameterChoiceSets: Record<string, Set<string>> = {}
  const unmatchedStepTexts = new Set(stepTexts)
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

        unmatchedStepTexts.delete(text)
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
      suggestions = suggestions.concat(
        buildSuggestionFromCucumberExpression(expression, registry, parameterChoices)
      )
    }
    if (expression instanceof RegularExpression) {
      suggestions = suggestions.concat(
        buildSuggestionsFromRegularExpression(expression, registry, stepTexts, parameterChoices)
      )
    }
  }

  for (const stepText of unmatchedStepTexts) {
    suggestions.push({
      label: stepText,
      segments: [stepText],
      matched: false,
    })
  }
  return suggestions.sort((a, b) => a.label.localeCompare(b.label))
}
