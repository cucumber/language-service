import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import { CompletionItem, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver-types'

import { parseGherkinDocument } from '../gherkin/parseGherkinDocument.js'
import { Index } from '../index/index.js'
import { lspCompletionSnippet } from './snippet/lspCompletionSnippet.js'

// https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#textDocument_completion
export function getGherkinCompletionItems(
  gherkinSource: string,
  line: number,
  index: Index
): readonly CompletionItem[] {
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
  const suggestions = index(text)
  return suggestions.map((suggestion) => {
    const item: CompletionItem = {
      label: suggestion.label,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Text,
      labelDetails: {
        ...(suggestion.matched ? {} : { detail: ' (undefined step)' }),
      },
      textEdit: {
        newText: lspCompletionSnippet(suggestion.segments),
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
    }
    return item
  })
}
