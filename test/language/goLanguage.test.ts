import assert from 'assert'

import { goLanguage, stringLiteral } from '../../src/language/goLanguage.js'
import { TreeSitterSyntaxNode } from '../../src/language/types.js'

function rawStringLiteral(expression: string): TreeSitterSyntaxNode {
  return {
    type: 'raw_string_literal',
    text: `\`${expression}\``,
    startPosition: { row: 1, column: 19 },
    endPosition: { row: 1, column: 21 + expression.length },
    children: [],
  }
}

describe('goLanguage', () => {
  it('should apply the leading inline flags of a Go regexp', () => {
    const cases: [string, string][] = [
      ['(?s)^a body "(.*)"$', 'a body "first line\nsecond line"'],
      ['(?i)^I eat (\\d+) cucumbers$', 'i EAT 3 Cucumbers'],
      ['(?is)^a body "(.*)"$', 'A BODY "first line\nsecond line"'],
      ['(?m)^a step$', 'a step'],
      ['(?U)^a (.+) step$', 'a lazy step'],
      ['(?i)^I eat', 'i EAT 3 cucumbers'],
      ['(?ii)^a step$', 'A STEP'],
    ]

    cases.forEach(([expression, stepText]) => {
      const regexp = goLanguage.toStepDefinitionExpression(rawStringLiteral(expression))
      assert(regexp instanceof RegExp, `${expression} should be a RegExp`)
      assert(regexp.test(stepText), `${expression} should match ${JSON.stringify(stepText)}`)
    })
  })

  it('should remove enclosing string quotations and backticks', () => {
    const cases = ['`^I eat (d+)$`', '"^I eat (d+)$"']

    cases.forEach((expression) => {
      const node: TreeSitterSyntaxNode = {
        type: 'raw_string_literal',
        text: expression,
        startPosition: { row: 1, column: 19 },
        endPosition: { row: 1, column: 19 + expression.length },
        children: [],
      }
      const result = stringLiteral(node)
      assert.deepStrictEqual(result, '^I eat (d+)$')
    })
  })
})
