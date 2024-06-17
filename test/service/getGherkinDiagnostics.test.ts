import { CucumberExpression, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types'

import { getGherkinDiagnostics } from '../../src/service/getGherkinDiagnostics.js'

describe('getGherkinDiagnostics', () => {
  it('returns no diagnostics for valid document', () => {
    const diagnostics = getGherkinDiagnostics(`Feature: Hello`, [])
    assert.deepStrictEqual(diagnostics, [])
  })

  it('returns error diagnostic for unexpected end of file', () => {
    const diagnostics = getGherkinDiagnostics(
      `Feature: Hello
@tag
`,
      []
    )
    assert.deepStrictEqual(diagnostics, [
      {
        message: '(3:0): unexpected end of file, expected: #TagLine, #RuleLine, #Comment, #Empty',
        range: {
          start: {
            line: 2,
            character: 0,
          },
          end: {
            line: 2,
            character: 0,
          },
        },
        severity: DiagnosticSeverity.Error,
        source: 'Cucumber',
      },
    ])
  })

  it('returns error diagnostic for missing table separator', () => {
    const expression = new CucumberExpression('a table:', new ParameterTypeRegistry())
    const diagnostics = getGherkinDiagnostics(
      `Feature: Hello
  Scenario: Hi
    Given a table:
      | a |
      | b
`,
      [expression]
    )
    const expectedDiagnostics: Diagnostic[] = [
      {
        message: '(5:7): inconsistent cell count within the table',
        range: {
          start: {
            line: 4,
            character: 6,
          },
          end: {
            line: 4,
            character: 9,
          },
        },
        severity: DiagnosticSeverity.Error,
        source: 'Cucumber',
      },
    ]
    assert.deepStrictEqual(diagnostics, expectedDiagnostics)
  })

  it('returns warning diagnostic for undefined Given->And step', () => {
    const diagnostics = getGherkinDiagnostics(
      `Feature: Hello
  Scenario: Hi
    Given a defined step
    And an undefined step
`,
      [new CucumberExpression('a defined step', new ParameterTypeRegistry())]
    )
    const expectedDiagnostics: Diagnostic[] = [
      {
        code: 'cucumber.undefined-step',
        codeDescription: {
          href: 'https://cucumber.io/docs/cucumber/step-definitions/',
        },
        data: {
          snippetKeyword: 'Given ',
          stepText: 'an undefined step',
        },
        message: 'Undefined step: an undefined step',
        range: {
          start: {
            line: 3,
            character: 8,
          },
          end: {
            line: 3,
            character: 25,
          },
        },
        severity: DiagnosticSeverity.Warning,
        source: 'Cucumber',
      },
    ]
    assert.deepStrictEqual(diagnostics, expectedDiagnostics)
  })

  it('returns warning diagnostic for undefined When->And->But step', () => {
    const diagnostics = getGherkinDiagnostics(
      `Feature: Hello
  Scenario: Hi
    Given a defined step
    When a defined step
    And a defined step
    But an undefined step
`,
      [new CucumberExpression('a defined step', new ParameterTypeRegistry())]
    )
    const expectedDiagnostics: Diagnostic[] = [
      {
        code: 'cucumber.undefined-step',
        codeDescription: {
          href: 'https://cucumber.io/docs/cucumber/step-definitions/',
        },
        data: {
          snippetKeyword: 'When ',
          stepText: 'an undefined step',
        },
        message: 'Undefined step: an undefined step',
        range: {
          start: {
            line: 5,
            character: 8,
          },
          end: {
            line: 5,
            character: 25,
          },
        },
        severity: DiagnosticSeverity.Warning,
        source: 'Cucumber',
      },
    ]
    assert.deepStrictEqual(diagnostics, expectedDiagnostics)
  })

  it('returns diagnostic for undefined step with unreferenced parameter in Scenario Outline', () => {
    const noExamples = `Feature:
      Scenario Outline:
        Given a <parameter>`
    const noTableHeader = `Feature:
      Scenario Outline:
        Given a <parameter>
        Examples:`
    const noTableBody = `Feature:
      Scenario Outline:
        Given a <parameter>
        Examples:
          | parameter |`

    for (const document of [noExamples, noTableHeader, noTableBody]) {
      const diagnostics = getGherkinDiagnostics(document, [])
      const expectedDiagnostics: Diagnostic[] = [
        {
          code: 'cucumber.undefined-step',
          codeDescription: {
            href: 'https://cucumber.io/docs/cucumber/step-definitions/',
          },
          data: {
            snippetKeyword: 'Given ',
            stepText: 'a <parameter>',
          },
          message: 'Undefined step: a <parameter>',
          range: {
            end: {
              character: 27,
              line: 2,
            },
            start: {
              character: 14,
              line: 2,
            },
          },
          severity: 2,
          source: 'Cucumber',
        },
      ]
      assert.deepStrictEqual(diagnostics, expectedDiagnostics)
    }
  })

  it('returns no diagnostics with valid parameter match in Scenario Outline', () => {
    const diagnostics = getGherkinDiagnostics(
      `Feature:
        Scenario Outline:
          Given a <state> <entity>
  
          Examples:
            | parameter | state   | entity | other  |
            | unused    | defined | step   | unused |
      `,
      [new CucumberExpression('a defined step', new ParameterTypeRegistry())]
    )
    const expectedDiagnostics: Diagnostic[] = []
    assert.deepStrictEqual(diagnostics, expectedDiagnostics)
  })

  it('returns diagnostic for incomplete docstring', () => {
    const diagnostics = getGherkinDiagnostics(
      `Feature: Hello
  Scenario: Hi
    Given a defined step
      """`,
      [new CucumberExpression('a defined step', new ParameterTypeRegistry())]
    )
    const expectedDiagnostics: Diagnostic[] = [
      {
        message: '(5:0): unexpected end of file, expected: #DocStringSeparator, #Other',
        range: {
          start: {
            line: 3,
            character: 9,
          },
          end: {
            line: 3,
            character: 9,
          },
        },
        severity: DiagnosticSeverity.Error,
        source: 'Cucumber',
      },
    ]
    assert.deepStrictEqual(diagnostics, expectedDiagnostics)
  })
})
