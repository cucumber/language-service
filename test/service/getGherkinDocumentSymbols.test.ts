import assert from 'assert'
import { DocumentSymbol, SymbolKind } from 'vscode-languageserver-types'

import { getGherkinDocumentSymbols } from '../../src/service/getGherkinDocumentSymbols.js'

describe('getGherkinFormattingEdits', () => {
  it('returns text Document Symbols from a Gherkin document', () => {
    const gherkinSource = `Feature: Hello
Scenario: World
Given something`
    const sourceDocumentSymbols = getGherkinDocumentSymbols(gherkinSource)
    const featureSymbol: DocumentSymbol[] = [
      {
        name: 'Scenario',
        detail: 'Feature',
        kind: SymbolKind.Field,
        range: {
          start: {
            line: 1,
            character: 0,
          },
          end: {
            line: 3,
            character: 15,
          },
        },
        selectionRange: {
          start: {
            line: 1,
            character: 0,
          },
          end: {
            line: 3,
            character: 15,
          },
        },
      },
    ]

    assert.deepStrictEqual(featureSymbol, sourceDocumentSymbols)
  })
})
