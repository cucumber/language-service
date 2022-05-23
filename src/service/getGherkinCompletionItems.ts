import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Position,
} from 'vscode-languageserver-types'

import { Index } from '../index/index.js'
import { getStepRange } from './helpers.js'
import { lspCompletionSnippet } from './snippet/lspCompletionSnippet.js'

// https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#textDocument_completion
export function getGherkinCompletionItems(
  gherkinSource: string,
  position: Position,
  index: Index
): readonly CompletionItem[] {
  const stepRange = getStepRange(gherkinSource, position)
  if (!stepRange) return []
  const suggestions = index(stepRange.stepText)
  // https://github.com/microsoft/language-server-protocol/issues/898#issuecomment-593968008
  return suggestions.map((suggestion, i) => {
    // The index has already sorted the syggestions by match score.
    // We're moving suggestions that are from undefined steps to the bottom
    const sortText = (suggestion.matched ? i + 1000 : i + 2000).toString()
    const item: CompletionItem = {
      label: suggestion.label,
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Text,
      labelDetails: {
        ...(suggestion.matched ? {} : { detail: ' (undefined step)' }),
      },
      // VSCode will only display suggestions that literally match the label.
      // We're overriding this behaviour by setting filterText to what the user has typed,
      // so that the suggestions are always displayed
      filterText: stepRange.stepText,
      sortText,
      textEdit: {
        newText: lspCompletionSnippet(suggestion.segments),
        range: stepRange.range,
      },
    }
    return item
  })
}
