import assert from 'node:assert'

import { stringLiteral } from '../../src/language/kotlinLanguage.js'
import type { TreeSitterSyntaxNode } from '../../src/language/types.js'

function node(text: string): TreeSitterSyntaxNode {
  return {
    type: 'string_literal',
    text,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: text.length },
    children: [],
  }
}

describe('kotlinLanguage', () => {
  describe('stringLiteral', () => {
    const cases: Record<string, string> = {
      '"plain"': 'plain',
      '"cost is \\$5"': 'cost is $5',
      '"say \\"hi\\""': 'say "hi"',
      '"the bee\\\'s knees"': "the bee's knees",
      '"tab\\there"': 'tab\there',
      '"line\\nbreak"': 'line\nbreak',
      '"\\u0041BC"': 'ABC',
      '"back\\\\slash"': 'back\\slash',
      '"\\\\d+"': '\\d+',
      '"\\\\$"': '\\$',
      '"unknown \\q escape"': 'unknown \\q escape',
      '"""raw \\d \\\\ \\$"""': 'raw \\d \\\\ \\$',
    }
    for (const [input, expected] of Object.entries(cases)) {
      it(`reads ${input}`, () => {
        assert.strictEqual(stringLiteral(node(input)), expected)
      })
    }
  })
})
