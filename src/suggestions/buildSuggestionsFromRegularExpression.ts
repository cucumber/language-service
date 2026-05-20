import { ParameterTypeRegistry, RegularExpression } from '@cucumber/cucumber-expressions'

import { ParameterChoices, Suggestion, SuggestionSegment } from './types'

export function buildSuggestionsFromRegularExpression(
  expression: RegularExpression,
  registry: ParameterTypeRegistry,
  stepTexts: Set<string>,
  parameterChoices: ParameterChoices
): readonly Suggestion[] {
  const segmentJsons = new Set<string>()

  for (const text of stepTexts) {
    const args = expression.match(text)
    if (args) {
      const parameterTypes = args.map((arg) => arg.getParameterType())
      const segments: SuggestionSegment[] = []
      let index = 0
      for (let argIndex = 0; argIndex < args.length; argIndex++) {
        const arg = args[argIndex]

        const textSegment = text.substring(index, arg.group.start)
        segments.push(textSegment)
        const parameterType = parameterTypes[argIndex]

        const key = parameterType.regexpStrings.join('|')
        const parameterSegment = parameterChoices[key] || ['...']
        segments.push(parameterSegment)

        if (arg.group.end !== undefined) index = arg.group.end
      }
      const lastSegment = text.substring(index)
      if (lastSegment !== '') {
        segments.push(lastSegment)
      }
      segmentJsons.add(JSON.stringify(segments))
    }
  }
  return [...segmentJsons].sort().map((s, n) => ({
    segments: JSON.parse(s) as SuggestionSegment[],
    label: n == 0 ? expression.source : `${expression.source} (${n + 1})`,
    matched: true,
  }))
}
