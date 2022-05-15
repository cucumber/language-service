import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import { LocationLink, Position } from 'vscode-languageserver-types'

import { parseGherkinDocument } from '../gherkin/parseGherkinDocument.js'

export function getStepDefinitionLocationLinks(
  gherkinSource: string,
  position: Position
): LocationLink[] {
  const { gherkinDocument } = parseGherkinDocument(gherkinSource)
  if (!gherkinDocument) {
    return []
  }
  let text: string | undefined = undefined
  // let startCharacter: number
  // let endCharacter: number
  walkGherkinDocument(gherkinDocument, undefined, {
    step(step) {
      if (step.location.line === position.line + 1 && step.location.column !== undefined) {
        text = step.text
        // startCharacter = step.location.column + step.keyword.length - 1
        // endCharacter = startCharacter + text.length
      }
    },
  })
  console.log(text)

  if (text === undefined) return []
  return []
}
