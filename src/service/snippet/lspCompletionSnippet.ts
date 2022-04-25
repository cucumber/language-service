/**
 * Generates an [LSP Completion Snippet]{@link https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#snippet_syntax}
 *
 * @param expression the expression to generate the snippet from
 */
import { SuggestionSegments } from '../../suggestions/types.js'

export function lspCompletionSnippet(segments: SuggestionSegments): string {
  let n = 1
  return segments
    .map((segment) => (Array.isArray(segment) ? lspPlaceholder(n++, segment) : segment))
    .join('')
}

function lspPlaceholder(i: number, choices: readonly string[]) {
  // Escape $ } \ , | in choices
  // https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#grammar
  const escapedChoices = choices
    .filter((choice) => choice !== '')
    .map((choice) => choice.replace(/([$\\},|])/g, '\\$1'))
  return `\${${i}|${escapedChoices.join(',')}|}`
}
