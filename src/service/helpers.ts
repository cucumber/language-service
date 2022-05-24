import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import { Position, Range } from 'vscode-languageserver-types'

import { parseGherkinDocument } from '../gherkin/parseGherkinDocument.js'

export type StepRange = {
  stepKeyword: string
  stepText: string
  range: Range
}

export function getStepRange(gherkinSource: string, position: Position): StepRange | undefined {
  const { gherkinDocument } = parseGherkinDocument(gherkinSource)
  if (!gherkinDocument) {
    return undefined
  }
  let stepKeyword: string | undefined = undefined
  let stepText: string | undefined = undefined
  let range: Range | undefined = undefined
  walkGherkinDocument(gherkinDocument, undefined, {
    step(step) {
      if (step.location.line === position.line + 1 && step.location.column !== undefined) {
        stepText = step.text
        stepKeyword = step.keyword
        const startCharacter = step.location.column + step.keyword.length - 1
        const endCharacter = startCharacter + stepText.length
        range = Range.create(position.line, startCharacter, position.line, endCharacter)
      }
    },
  })
  if (stepKeyword && stepText && range) {
    return {
      stepKeyword,
      stepText,
      range,
    }
  }
}
