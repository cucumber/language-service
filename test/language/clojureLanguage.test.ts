import assert from 'assert'

import { clojureLanguage } from '../../src/language/clojureLanguage.js'
import { TreeSitterSyntaxNode } from '../../src/language/types.js'

describe('clojureLanguage', () => {
  ;(it('Dicsern RegExp types', () => {
    const cases = [
      '"I eat (d+)"`',
      '"I eat (.*)"',
      '"I eat (apple|pear)"',
      '"I eat \\{ apples \\} and (.*)"',
      '"^I eat apples$"',
    ]

    cases.forEach((expression) => {
      const node: TreeSitterSyntaxNode = {
        type: 'raw_string_literal',
        text: expression,
        startPosition: { row: 1, column: 19 },
        endPosition: { row: 1, column: 19 + expression.length },
        children: [],
      }
      const result = clojureLanguage.toStepDefinitionExpression(node)
      assert(result instanceof RegExp, `Failed to identify ${expression} as regexp`)
    })
  }),
    it('Dicsern text types', () => {
      const cases = ['"I eat {}"', '"I eat {int}"']

      cases.forEach((expression) => {
        const node: TreeSitterSyntaxNode = {
          type: 'raw_string_literal',
          text: expression,
          startPosition: { row: 1, column: 19 },
          endPosition: { row: 1, column: 19 + expression.length },
          children: [],
        }
        const result = clojureLanguage.toStepDefinitionExpression(node)
        assert.strictEqual(typeof result, 'string', `Failed to identify ${expression} as string`)
      })
    }))
})
