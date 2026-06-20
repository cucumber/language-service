import { pretty } from '@cucumber/gherkin-utils'
import { TextEdit } from 'vscode-languageserver-types'

import { isMarkdownFeatureUri } from '../gherkin/isMarkdownFeatureUri.js'
import { parseGherkinDocument } from '../gherkin/parseGherkinDocument.js'

// https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#textDocument_formatting
export function getGherkinFormattingEdits(gherkinSource: string, uri?: string): TextEdit[] {
  const { gherkinDocument } = parseGherkinDocument(gherkinSource, uri)
  if (gherkinDocument === undefined) return []

  // pretty() emits classic Gherkin and would destroy the Markdown layout of a .feature.md
  // document (headers, fenced steps, etc.). Until gherkin-utils gains a Markdown-aware
  // formatter, skip formatting for MDG files.
  if (isMarkdownFeatureUri(uri)) {
    return []
  }

  const newText = pretty(gherkinDocument)
  const lines = gherkinSource.split(/\r?\n/)
  const line = lines.length - 1
  const character = lines[line].length
  const textEdit: TextEdit = {
    newText,
    range: {
      start: {
        line: 0,
        character: 0,
      },
      end: {
        line,
        character,
      },
    },
  }
  return [textEdit]
}
