import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { CodeAction, LocationLink, Range } from 'vscode-languageserver-types'

import { getGenerateSnippetCodeAction } from '../../src/service/getGenerateSnippetCodeAction.js'
import { makeUndefinedStepDiagnostic } from '../../src/service/getGherkinDiagnostics.js'

describe('getGenerateSnippetCodeAction', () => {
  it('generates code in a new file', () => {
    const diagnostic = makeUndefinedStepDiagnostic(10, 4, 'Given ', 'I have 43 cukes')

    const targetRange = Range.create(10, 0, 10, 0)
    const link: LocationLink = {
      targetUri: 'file://home/features/step_definitions/steps.ts',
      targetRange,
      targetSelectionRange: targetRange,
    }
    const action = getGenerateSnippetCodeAction(
      [diagnostic],
      link,
      'step_definitions/steps.ts',
      true,
      undefined,
      'typescript',
      new ParameterTypeRegistry()
    )
    const expectedAction: CodeAction = {
      title: 'Define in step_definitions/steps.ts',
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
            stepKeyword: 'Given ',
            stepText: 'I have 43 cukes',
          },
        },
      ],
      kind: 'quickfix',
      edit: {
        documentChanges: [
          {
            kind: 'create',
            uri: 'file://home/features/step_definitions/steps.ts',
            options: {
              ignoreIfExists: true,
              overwrite: true,
            },
          },
          {
            textDocument: {
              uri: 'file://home/features/step_definitions/steps.ts',
              version: 0,
            },
            edits: [
              {
                range: {
                  start: {
                    line: 10,
                    character: 0,
                  },
                  end: {
                    line: 10,
                    character: 0,
                  },
                },
                newText: `
Given('I have {int} cukes', (int: number) => {
  // Write code here that turns the phrase above into concrete actions
})
`,
              },
            ],
          },
        ],
      },
      isPreferred: true,
    }

    assert.deepStrictEqual(action, expectedAction)
  })

  it('generates code in an existing file', () => {
    const diagnostic = makeUndefinedStepDiagnostic(10, 4, 'Given ', 'I have 43 cukes')

    const targetRange = Range.create(10, 0, 10, 0)
    const link: LocationLink = {
      targetUri: 'file://home/features/step_definitions/steps.ts',
      targetRange,
      targetSelectionRange: targetRange,
    }

    const action = getGenerateSnippetCodeAction(
      [diagnostic],
      link,
      'step_definitions/steps.ts',
      false,
      undefined,
      'typescript',
      new ParameterTypeRegistry()
    )
    const expectedAction: CodeAction = {
      title: 'Define in step_definitions/steps.ts',
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
            stepKeyword: 'Given ',
            stepText: 'I have 43 cukes',
          },
        },
      ],
      kind: 'quickfix',
      edit: {
        documentChanges: [
          {
            textDocument: {
              uri: 'file://home/features/step_definitions/steps.ts',
              version: 0,
            },
            edits: [
              {
                range: {
                  start: {
                    line: 10,
                    character: 0,
                  },
                  end: {
                    line: 10,
                    character: 0,
                  },
                },
                newText: `
Given('I have {int} cukes', (int: number) => {
  // Write code here that turns the phrase above into concrete actions
})
`,
              },
            ],
          },
        ],
      },
      isPreferred: true,
    }
    assert.deepStrictEqual(action, expectedAction)
  })
})
