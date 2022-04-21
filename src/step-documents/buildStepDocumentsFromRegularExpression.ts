import { ParameterTypeRegistry, RegularExpression } from '@cucumber/cucumber-expressions'

import { ParameterChoices, StepDocument, StepSegment } from './types'

export function buildStepDocumentsFromRegularExpression(
  expression: RegularExpression,
  registry: ParameterTypeRegistry,
  stepTexts: readonly string[],
  parameterChoices: ParameterChoices
): StepDocument[] {
  const stepDocuments: StepDocument[] = []
  for (const text of stepTexts) {
    const args = expression.match(text)
    if (args) {
      const parameterTypes = args.map((arg) => arg.getParameterType())
      const segments: StepSegment[] = []
      let index = 0
      for (let argIndex = 0; argIndex < args.length; argIndex++) {
        const arg = args[argIndex]

        const textSegment = text.substring(index, arg.group.start)
        segments.push(textSegment)
        const parameterType = parameterTypes[argIndex]

        const key = parameterType.regexpStrings.join('|')
        const parameterSegment = parameterChoices[key]
        segments.push(parameterSegment)

        if (arg.group.end !== undefined) index = arg.group.end
      }
      const lastSegment = text.substring(index)
      if (lastSegment !== '') {
        segments.push(lastSegment)
      }

      stepDocuments.push({
        suggestion: expression.source,
        segments,
      })
    }
  }
  return stepDocuments
}
