import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { CodeAction } from 'vscode-languageserver-types'

import { getGenerateSnippetCodeActions } from '../../src/service/getGenerateSnippetCodeActions.js'
import { makeUndefinedStepDiagnostic } from '../../src/service/getGherkinDiagnostics.js'

describe('getGenerateSnippetCodeActions', () => {
  it('generates code', () => {
    const diagnostic = makeUndefinedStepDiagnostic(10, 4, 'I have 43 cukes')
    const mustacheTemplate = `
Given('{{ expression }}', ({{ #parameters }}{{ name }}: {{ type }}{{ /parameters }}) => {
})
`

    const actions = getGenerateSnippetCodeActions(
      [diagnostic],
      'features/step_defnitions/steps.ts',
      mustacheTemplate,
      'typescript',
      new ParameterTypeRegistry()
    )
    const expectedActions: CodeAction[] = [
      {
        title: 'Generate step definition',
        diagnostics: [
          {
            severity: 2,
            range: {
              start: {
                line: 10,
                character: 4,
              },
              end: {
                line: 10,
                character: 19,
              },
            },
            message: 'Undefined step: I have 43 cukes',
            source: 'Cucumber',
            code: 'cucumber.undefined-step',
            codeDescription: {
              href: 'https://cucumber.io/docs/cucumber/step-definitions/',
            },
            data: {
              stepText: 'I have 43 cukes',
            },
          },
        ],
        kind: 'quickfix',
        edit: {
          documentChanges: [
            {
              kind: 'create',
              uri: 'features/step_defnitions/steps.ts',
              options: {
                ignoreIfExists: true,
                overwrite: true,
              },
            },
            {
              textDocument: {
                uri: 'features/step_defnitions/steps.ts',
                version: 0,
              },
              edits: [
                {
                  range: {
                    start: {
                      line: 0,
                      character: 0,
                    },
                    end: {
                      line: 0,
                      character: 0,
                    },
                  },
                  newText: `
Given('I have {int} cukes', (i: number) => {
})
`,
                },
              ],
            },
            {
              textDocument: {
                uri: 'features/step_defnitions/steps.ts',
                version: 0,
              },
              edits: [
                {
                  range: {
                    start: {
                      line: 0,
                      character: 0,
                    },
                    end: {
                      line: 0,
                      character: 0,
                    },
                  },
                  newText: `
Given('I have {float} cukes', (f: number) => {
})
`,
                },
              ],
            },
          ],
        },
        isPreferred: true,
      },
    ]
    assert.deepStrictEqual(actions, expectedActions)
  })
})