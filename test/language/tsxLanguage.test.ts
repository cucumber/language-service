import assert from 'assert'

import { toStringOrRegExp } from '../../src/language/tsxLanguage.js'
import { TreeSitterSyntaxNode } from '../../src/language/types.js'

describe('tsxLanguage', () => {
  it('should preserve regexp flags in step definitions', () => {
    const regex: TreeSitterSyntaxNode = {
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
    const result = toStringOrRegExp(regex)
    assert.deepStrictEqual(result, /^a regexp$/imu)
  })
})
