import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import * as messages from '@cucumber/messages'
import { DocumentSymbol, Position, Range, SymbolKind } from 'vscode-languageserver-types'

import { parseGherkinDocument } from '../gherkin/parseGherkinDocument.js'

type SymbolsKey = 'feature' | 'parent'
type Symbols = Partial<Record<SymbolsKey, DocumentSymbol>>

export function getGherkinDocumentFeatureSymbol(gherkinSource: string): DocumentSymbol | null {
  const { gherkinDocument } = parseGherkinDocument(gherkinSource)
  if (!gherkinDocument) {
    return null
  }

  const symbols: Symbols = {}

  const data = walkGherkinDocument<Symbols>(gherkinDocument, symbols, {
    feature(feature, symbols) {
      const prefix = `${feature.keyword}: `
      const name = `${prefix}${feature.name}`
      const range = makeRange(feature.location, prefix, name)

      const sym: DocumentSymbol = {
        name,
        range,
        selectionRange: range,
        kind: SymbolKind.File,
        children: [],
      }
      return { ...symbols, feature: sym, parent: sym }
    },
    rule(rule, symbols) {
      const prefix = `${rule.keyword}: `
      const name = `${prefix}${rule.name}`
      const range = makeRange(rule.location, prefix, name)

      const sym: DocumentSymbol = {
        name,
        range,
        selectionRange: range,
        kind: SymbolKind.Interface,
        children: [],
      }
      symbols.parent?.children?.push(sym)
      return { ...symbols, parent: sym }
    },
    background(background, symbols) {
      const prefix = `${background.keyword}: `
      const name = `${prefix}${background.name}`
      const range = makeRange(background.location, prefix, name)

      const sym: DocumentSymbol = {
        name,
        range,
        selectionRange: range,
        kind: SymbolKind.Constructor,
        children: [],
      }
      symbols.parent?.children?.push(sym)
      return symbols
    },
    scenario(scenario, symbols) {
      const prefix = `${scenario.keyword}: `
      const name = `${prefix}${scenario.name}`
      const range = makeRange(scenario.location, prefix, name)

      const sym: DocumentSymbol = {
        name,
        range,
        selectionRange: range,
        kind: SymbolKind.Event,
        children: [],
      }
      symbols.parent?.children?.push(sym)
      return symbols
    },
  })

  return data.feature || null
}

function makeRange(location: messages.Location, prefix: string, name: string) {
  const line = location.line - 1
  const col = (location.column || 0) - 1
  return Range.create(
    Position.create(line, col + prefix.length),
    Position.create(line, col + name.length)
  )
}
