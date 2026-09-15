import assert from 'assert'
import { TextEdit } from 'vscode-languageserver-types'

import { getGherkinFormattingEdits } from '../../src/service/getGherkinFormattingEdits.js'

describe('getGherkinFormattingEdits', () => {
  it('returns no edits for a .feature.md document (Markdown layout is preserved)', () => {
    const mdgSource = `# Feature: Login

## Scenario: Successful login
* Given the user is on the login page
`
    assert.deepStrictEqual(getGherkinFormattingEdits(mdgSource, 'file:///x.feature.md'), [])
  })

  it('returns text edits that prettifies a Gherkin document', () => {
    const gherkinSource = `Feature: Hello
Scenario: World
Given something`
    const textEdits = getGherkinFormattingEdits(gherkinSource)
    const expectedTextEdit: TextEdit = {
      newText: `Feature: Hello

  Scenario: World
    Given something
`,
      range: {
        start: {
          line: 0,
          character: 0,
        },
        end: {
          line: 2,
          character: 15,
        },
      },
    }
    assert.deepStrictEqual([expectedTextEdit], textEdits)
  })
})
