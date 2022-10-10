import assert from 'assert'

import { toStringOrRegExp } from '../../src/language/tsxLanguage.js'
import { TreeSitterSyntaxNode } from '../../src/language/types.js'

describe('tsxLanguage', () => {
  it('should preserve regexp flags in step definitions', () => {
    const node: TreeSitterSyntaxNode = {
      type: 'regex',
      text: '/^a regexp$/imu',
      startPosition: { row: 0, column: 6 },
      endPosition: { row: 0, column: 21 },
      children: [
        {
          type: 'regex_pattern',
          text: '^a regexp$',
          startPosition: { row: 0, column: 7 },
          endPosition: { row: 0, column: 17 },
          children: [],
        },
        {
          type: 'regex_flags',
          text: 'imu',
          startPosition: { row: 0, column: 18 },
          endPosition: { row: 0, column: 21 },
          children: [],
        },
      ],
    }
    const result = toStringOrRegExp(node)
    assert.deepStrictEqual(result, /^a regexp$/imu)
  })

  it('should generate cucumber expression strings from template literals without substitution', () => {
    const node: TreeSitterSyntaxNode = {
      type: 'template_string',
      text: '`hello there`',
      startPosition: { row: 0, column: 5 },
      endPosition: { row: 0, column: 18 },
      children: [],
    }
    const result = toStringOrRegExp(node)
    assert.deepStrictEqual(result, 'hello there')
  })
})
