import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import { CompletionItem, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver-types'

import { Index, lspCompletionSnippet } from './index.js'
import { parseGherkinDocument } from './parseGherkinDocument.js'

// https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#textDocument_completion
export function getGherkinCompletionItems(
  gherkinSource: string,
  line: number,
  index: Index
): CompletionItem[] {
  const { gherkinDocument } = parseGherkinDocument(gherkinSource)
  if (!gherkinDocument) {
    return []
  }
  let text: string | undefined = undefined
  let startCharacter: number
  let endCharacter: number
  walkGherkinDocument(gherkinDocument, undefined, {
    step(step) {
      if (step.location.line === line + 1 && step.location.column !== undefined) {
        text = step.text
        startCharacter = step.location.column + step.keyword.length - 1
        endCharacter = startCharacter + text.length
      }
    },
  })
  if (text === undefined) return []
  const stepDocuments = index(text)
  return stepDocuments.map((stepDocument) => ({
    label: stepDocument.suggestion,
    insertTextFormat: InsertTextFormat.Snippet,
    kind: CompletionItemKind.Text,
    textEdit: {
      newText: lspCompletionSnippet(stepDocument.segments),
      range: {
        start: {
          line,
          character: startCharacter,
        },
        end: {
          line,
          character: endCharacter,
        },
      },
    },
  }))
}
