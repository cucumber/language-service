import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import { DocumentSymbol, Range, SymbolKind } from 'vscode-languageserver-types'

import { parseGherkinDocument } from '../gherkin/parseGherkinDocument.js'

const R: Range = {
  start: {
    line: 0,
    character: 0,
  },
  end: {
    line: 0,
    character: 0,
  },
}

type SymbolsKey = 'feature' | 'parent'
type Symbols = Partial<Record<SymbolsKey, DocumentSymbol>>

export function getGherkinDocumentFeatureSymbol(gherkinSource: string): DocumentSymbol | null {
  const { gherkinDocument, error } = parseGherkinDocument(gherkinSource)
  if (error) {
    console.error(error)
  }
  if (!gherkinDocument) {
    return null
  }

  const symbols: Symbols = {}

  const data = walkGherkinDocument<Symbols>(gherkinDocument, symbols, {
    feature(feature, symbols) {
      const sym: DocumentSymbol = {
        name: `${feature.keyword}: ${feature.name}`,
        range: R,
        selectionRange: R,
        kind: SymbolKind.Class,
        children: [],
      }
      return { ...symbols, feature: sym, parent: sym }
    },
    rule(rule, symbols) {
      const sym: DocumentSymbol = {
        name: `${rule.keyword}: ${rule.name}`,
        range: R,
        selectionRange: R,
        kind: SymbolKind.Class,
        children: [],
      }
      symbols.parent?.children?.push(sym)
      return { ...symbols, parent: sym }
    },
    background(background, symbols) {
      const sym: DocumentSymbol = {
        name: `${background.keyword}: ${background.name}`,
        range: R,
        selectionRange: R,
        kind: SymbolKind.Class,
        children: [],
      }
      symbols.parent?.children?.push(sym)
      return symbols
    },
    scenario(scenario, symbols) {
      const sym: DocumentSymbol = {
        name: `${scenario.keyword}: ${scenario.name}`,
        range: R,
        selectionRange: R,
        kind: SymbolKind.Class,
        children: [],
      }
      symbols.parent?.children?.push(sym)
      return symbols
    },
  })

  return data.feature || null
}
