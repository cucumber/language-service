import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { CodeAction } from 'vscode-languageserver-types'

import { getGenerateSnippetCodeActions } from '../../src/service/getGenerateSnippetCodeActions.js'
import { makeUndefinedStepDiagnostic } from '../../src/service/getGherkinDiagnostics.js'
import { Names, Types } from '../../src/service/snippet/stepDefinitionSnippet.js'

describe('getGenerateSnippetCodeActions', () => {
  it('generates code', () => {
    const diagnostic = makeUndefinedStepDiagnostic(10, 4, 'I have 43 cukes')
    const mustacheTemplate = `
Given('{{ expression }}', procedure ({{ #parameters }}{{ name }}: {{ type }}{{ /parameters }}) {
})
`
    const types: Types = {
      int: 'number',
      float: 'number',
      word: 'string',
      string: 'string',
      double: 'number',
      bigdecimal: 'string',
      byte: 'number',
      short: 'number',
      long: 'number',
      biginteger: 'BigInt',
      '': 'unknown',
    }

    const names: Names = {
      string: 's',
      biginteger: 'bigint',
      '': 'arg',
    }

    const actions = getGenerateSnippetCodeActions(
      [diagnostic],
      'features/step_defnitions/steps.xyz',
      mustacheTemplate,
      types,
      names,
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
              uri: 'features/step_defnitions/steps.xyz',
              options: {
                ignoreIfExists: true,
                overwrite: true,
              },
            },
            {
              textDocument: {
                uri: 'features/step_defnitions/steps.xyz',
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
Given('I have {int} cukes', procedure (int: number) {
})
`,
                },
              ],
            },
            {
              textDocument: {
                uri: 'features/step_defnitions/steps.xyz',
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
Given('I have {float} cukes', procedure (float: number) {
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
