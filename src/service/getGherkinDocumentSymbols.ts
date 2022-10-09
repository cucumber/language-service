import { Expression } from '@cucumber/cucumber-expressions'
import { dialects, Errors } from '@cucumber/gherkin'
import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import { DocumentSymbol } from 'vscode-languageserver-types'

import { parseGherkinDocument } from '../gherkin/parseGherkinDocument.js'

export function getGherkinDocumentSymbols(gherkinSource: string): readonly DocumentSymbol[] {
  const symbols: DocumentSymbol[] = []
  const lines = gherkinSource.split(/\r?\n/)
  const { gherkinDocument, error } = parseGherkinDocument(gherkinSource)

  if (!gherkinDocument?.feature) {
    return symbols
  }
  let inScenarioOutline = false
  const dialect = dialects[gherkinDocument.feature.language]
  const noStars = (keyword: string) => keyword !== '* '
  const codeKeywords = [...dialect.given, ...dialect.when, ...dialect.then].filter(noStars)
  let snippetKeyword = dialect.given.filter(noStars)[0]

  return walkGherkinDocument<DocumentSymbol[]>(gherkinDocument, symbols, {
    scenario(scenario, symbols) {
      inScenarioOutline = (scenario.examples || []).length > 0
      return symbols
    },
    step(step, symbols) {
      if (inScenarioOutline) {
        return symbols
      }
      if (codeKeywords.includes(step.keyword)) {
        snippetKeyword = step.keyword
      }

      if (step.location.column !== undefined) {
        const line = step.location.line - 1
        const character = step.location.column - 1 + step.keyword.length

        return symbols.concat(symbols)
      }
      return symbols
    },
  })
}

function isUndefined(stepText: string, expressions: readonly Expression[]): boolean {
  for (const expression of expressions) {
    if (expression.match(stepText)) return false
  }
  return true
}
