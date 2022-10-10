import assert from 'assert'

import { toStringOrRegExp } from '../../src/language/rubyLanguage.js'
import { TreeSitterSyntaxNode } from '../../src/language/types.js'

describe('rubyLanguage', () => {
  it('should preserve regexp flags in step definitions', () => {
    const node: TreeSitterSyntaxNode = {
      type: 'regex',
      text: '/^a regexp$/i',
      startPosition: { row: 0, column: 6 },
      endPosition: { row: 0, column: 19 },
      children: [
        {
          type: 'string_content',
          text: '^a regexp$',
          startPosition: { row: 0, column: 7 },
          endPosition: { row: 0, column: 17 },
          children: [],
        },
      ],
    }
    const result = toStringOrRegExp(node)
    assert.deepStrictEqual(result, /^a regexp$/i)
  })
})
