import assert from 'assert'

import { stringLiteral } from '../../src/language/goLanguage.js'
import { TreeSitterSyntaxNode } from '../../src/language/types.js'

describe('goLanguage', () => {
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
