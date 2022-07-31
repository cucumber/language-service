import { CucumberExpression, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { SemanticTokenTypes, uinteger } from 'vscode-languageserver-types'

import {
  getGherkinSemanticTokens,
  semanticTokenTypes,
} from '../../src/service/getGherkinSemanticTokens.js'

type TokenWithType = [string, SemanticTokenTypes]

describe('getGherkinSemanticTokens', () => {
  it('creates tokens for keywords', () => {
    const gherkinSource = `# some comment
@foo @bar
Feature: a
  This is a description
  and so is this

  Background:
    Given a repeating step

  Scenario: b
    Given I have 42 cukes in my belly
      """sometype
     hello
        world
       """
    And a table
      | a  | bbb |
      | cc |  dd |

  Scenario Outline: c
    Given a <foo> and <bar>

    Examples:
      | foo | bar |
      | a   | b   |
`
    const expression = new CucumberExpression(
      'I have {int} cukes in my {word}',
      new ParameterTypeRegistry()
    )

    const semanticTokens = getGherkinSemanticTokens(gherkinSource, [expression])
    const actual = tokenize(gherkinSource, semanticTokens.data)
    const expected: TokenWithType[] = [
      ['@foo', SemanticTokenTypes.type],
      ['@bar', SemanticTokenTypes.type],
      ['Feature', SemanticTokenTypes.keyword],
      ['Background', SemanticTokenTypes.keyword],
      ['Given ', SemanticTokenTypes.keyword],
      ['Scenario', SemanticTokenTypes.keyword],
      ['Given ', SemanticTokenTypes.keyword],
      ['42', SemanticTokenTypes.parameter],
      ['belly', SemanticTokenTypes.parameter],
      ['"""', SemanticTokenTypes.string],
      ['sometype', SemanticTokenTypes.type],
      ['hello', SemanticTokenTypes.string],
      ['world', SemanticTokenTypes.string],
      ['"""', SemanticTokenTypes.string],
      ['And ', SemanticTokenTypes.keyword],
      ['a', SemanticTokenTypes.string],
      ['bbb', SemanticTokenTypes.string],
      ['cc', SemanticTokenTypes.string],
      ['dd', SemanticTokenTypes.string],
      ['Scenario Outline', SemanticTokenTypes.keyword],
      ['Given ', SemanticTokenTypes.keyword],
      ['<foo>', SemanticTokenTypes.variable],
      ['<bar>', SemanticTokenTypes.variable],
      ['Examples', SemanticTokenTypes.keyword],
      ['foo', SemanticTokenTypes.property],
      ['bar', SemanticTokenTypes.property],
      ['a', SemanticTokenTypes.string],
      ['b', SemanticTokenTypes.string],
    ]
    assert.deepStrictEqual(actual, expected)
  })
})

// See https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#textDocument_semanticTokens
// for details about how tokens are encoded
function tokenize(source: string, tokenData: readonly uinteger[]): readonly TokenWithType[] {
  const result: TokenWithType[] = []
  const lines = source.split('\n')
  let lineIndex = 0
  let start = 0
  for (let i = 0; i < tokenData.length; i += 5) {
    const deltaLine = tokenData[i]
    if (deltaLine > 0) {
      start = 0
    }
    lineIndex += deltaLine
    start += tokenData[i + 1]
    const length = tokenData[i + 2]
    const token = lines[lineIndex].substring(start, start + length)
    const tokenTypeIndex = tokenData[i + 3]
    const tokenType = semanticTokenTypes[tokenTypeIndex]
    result.push([token, tokenType])
  }
  return result
}
