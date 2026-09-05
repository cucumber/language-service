import assert from 'assert'

import { parseGherkinDocument } from '../../src/gherkin/parseGherkinDocument.js'

describe('parseGherkinDocument', () => {
  it('returns a GherkinDocument for unexpected EOF', () => {
    const source = `Feature: Hello
@tag
`
    const { gherkinDocument, error } = parseGherkinDocument(source)
    assert.strictEqual(gherkinDocument!.feature!.name, 'Hello')
    assert.strictEqual(
      error!.message,
      'Parser errors:\n(3:0): unexpected end of file, expected: #TagLine, #RuleLine, #Comment, #Empty'
    )
  })

  it('parses a Markdown-with-Gherkin document when uri ends with .feature.md', () => {
    const source = `# Feature: Login

Description paragraph that is just prose.

## Scenario: Successful login
* Given the user is on the login page
* When the user enters valid credentials
* Then the user should be logged in

## Scenario: Failed login
* Given the user is on the login page
* When the user enters invalid credentials
* Then the user should see an error message
`
    const { gherkinDocument, error } = parseGherkinDocument(source, 'file:///x.feature.md')
    assert.strictEqual(error, undefined)
    assert.strictEqual(gherkinDocument!.feature!.name, 'Login')
    assert.strictEqual(gherkinDocument!.feature!.children!.length, 2)
    assert.deepStrictEqual(
      gherkinDocument!.feature!.children!.map((c) => c.scenario?.name),
      ['Successful login', 'Failed login']
    )
  })

  it('falls back to the classic matcher when uri is omitted', () => {
    // This source is valid classic Gherkin but would be garbage in MDG mode
    // (no `#` headers) — it must parse as classic because no uri is given.
    const source = `Feature: Hello
  Scenario: Hi
    Given something
`
    const { gherkinDocument, error } = parseGherkinDocument(source)
    assert.strictEqual(error, undefined)
    assert.strictEqual(gherkinDocument!.feature!.name, 'Hello')
  })
})
