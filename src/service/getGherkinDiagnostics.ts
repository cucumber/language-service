import { Expression } from '@cucumber/cucumber-expressions'
import { dialects, Errors } from '@cucumber/gherkin'
import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types'

import { parseGherkinDocument } from '../gherkin/parseGherkinDocument.js'
import { diagnosticCodeUndefinedStep } from './constants.js'

// https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#diagnostic
export function getGherkinDiagnostics(
  gherkinSource: string,
  expressions: readonly Expression[]
): Diagnostic[] {
  const lines = gherkinSource.split(/\r?\n/)
  const { gherkinDocument, error } = parseGherkinDocument(gherkinSource)
  const diagnostics: Diagnostic[] = []
  const errors: Error[] =
    error instanceof Errors.CompositeParserException ? error.errors : error ? [error] : []
  for (const error of errors) {
    if (error instanceof Errors.GherkinException) {
      const line = error.location.line - 1
      const character = error.location.column !== undefined ? error.location.column - 1 : 0
      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: {
            line,
            character,
          },
          end: {
            line,
            character: lines[line].length,
          },
        },
        message: error.message,
        source: 'Cucumber',
      }
      diagnostics.push(diagnostic)
    }
  }

  if (!gherkinDocument?.feature) {
    return diagnostics
  }

  let inScenarioOutline = false
  const dialect = dialects[gherkinDocument.feature.language]
  const noStars = (keyword: string) => keyword !== '* '
  const codeKeywords = [...dialect.given, ...dialect.when, ...dialect.then].filter(noStars)
  let snippetKeyword = dialect.given.filter(noStars)[0]

  return walkGherkinDocument<Diagnostic[]>(gherkinDocument, diagnostics, {
    scenario(scenario, diagnostics) {
      inScenarioOutline = (scenario.examples || []).length > 0
      return diagnostics
    },
    step(step, diagnostics) {
      if (inScenarioOutline) {
        return diagnostics
      }
      if (codeKeywords.includes(step.text)) {
        snippetKeyword = step.text
      }

      if (isUndefined(step.text, expressions) && step.location.column !== undefined) {
        const line = step.location.line - 1
        const character = step.location.column - 1 + step.keyword.length
        const diagnostic: Diagnostic = makeUndefinedStepDiagnostic(
          line,
          character,
          step.keyword,
          step.text,
          snippetKeyword
        )
        return diagnostics.concat(diagnostic)
      }
      return diagnostics
    },
  })
}

export function makeUndefinedStepDiagnostic(
  line: number,
  character: number,
  stepKeyword: string,
  stepText: string,
  snippetKeyword: string
): Diagnostic {
  return {
    severity: DiagnosticSeverity.Warning,
    range: {
      start: {
        line,
        character,
      },
      end: {
        line,
        character: character + stepText.length,
      },
    },
    message: `Undefined step: ${stepText}`,
    source: 'Cucumber',
    code: diagnosticCodeUndefinedStep,
    codeDescription: {
      href: 'https://cucumber.io/docs/cucumber/step-definitions/',
    },
    data: {
      snippetKeyword,
      stepText,
    },
  }
}

function isUndefined(stepText: string, expressions: readonly Expression[]): boolean {
  for (const expression of expressions) {
    if (expression.match(stepText)) return false
  }
  return true
}
