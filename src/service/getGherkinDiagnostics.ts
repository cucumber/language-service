import { Expression } from '@cucumber/cucumber-expressions'
import { dialects, Errors } from '@cucumber/gherkin'
import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import * as messages from '@cucumber/messages'
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types'

import { parseGherkinDocument } from '../gherkin/parseGherkinDocument.js'
import { CONTAINS_PARAMETERS, diagnosticCodeUndefinedStep } from './constants.js'

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
      let line = error.location.line - 1
      let character = error.location.column !== undefined ? error.location.column - 1 : 0
      if (line >= lines.length) {
        // EOF issue, e.g. something is not properly terminated
        line = lines.length - 1
        character = lines[line].length
      }
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
  let examples: readonly messages.Examples[]

  return walkGherkinDocument<Diagnostic[]>(gherkinDocument, diagnostics, {
    scenario(scenario, diagnostics) {
      inScenarioOutline = (scenario.examples || []).length > 0
      examples = inScenarioOutline ? scenario.examples : []
      return diagnostics
    },
    step(step, diagnostics) {
      if (codeKeywords.includes(step.keyword)) {
        snippetKeyword = step.keyword
      }
      return inScenarioOutline
        ? getOutlineStepDiagnostics(step, diagnostics, expressions, snippetKeyword, examples)
        : getStepDiagnostics(step, diagnostics, expressions, snippetKeyword)
    },
  })
}

function getOutlineStepDiagnostics(
  step: messages.Step,
  diagnostics: Diagnostic[],
  expressions: readonly Expression[],
  snippetKeyword: string,
  examples: readonly messages.Examples[]
): Diagnostic[] {
  // Interpolate steps containing parameters
  if (CONTAINS_PARAMETERS.test(step.text)) {
    for (const example of examples) {
      for (const row of example.tableBody) {
        const stepText = interpolate(
          step.text,
          // @ts-ignore Can not be undefined with non-empty table body
          example.tableHeader.cells,
          row.cells
        )

        if (!isUndefined(stepText, expressions)) {
          return diagnostics
        }
      }
    }
  }

  return getStepDiagnostics(step, diagnostics, expressions, snippetKeyword)
}

function getStepDiagnostics(
  step: messages.Step,
  diagnostics: Diagnostic[],
  expressions: readonly Expression[],
  snippetKeyword: string
): Diagnostic[] {
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

function interpolate(
  name: string,
  variableCells: readonly messages.TableCell[],
  valueCells: readonly messages.TableCell[]
): string {
  variableCells.forEach((variableCell, n) => {
    const valueCell = valueCells[n]
    const valuePattern = '<' + variableCell.value + '>'
    const escapedPattern = valuePattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regexp = new RegExp(escapedPattern, 'g')
    // JS Specific - dollar sign needs to be escaped with another dollar sign
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter
    const replacement = valueCell.value.replace(new RegExp('\\$', 'g'), '$$$$')
    name = name.replace(regexp, replacement)
  })
  return name
}
