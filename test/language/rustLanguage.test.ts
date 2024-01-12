import assert from 'assert'

import { stringLiteral } from '../../src/language/rustLanguage.js'
import { TreeSitterSyntaxNode } from '../../src/language/types.js'

describe('rustLanguage', () => {
  it('should extract string literal pattern', () => {
    const cases = [
      {
        input: '"the bee\'s knees"',
        expected: "the bee's knees",
      },
      {
        input: '"a {uuid}"',
        expected: 'a {uuid}',
      },
      {
        input: 'r"^a regexp$"',
        expected: '^a regexp$',
      },
      {
        // eslint-disable-next-line
        input: 'r"^stream (\w+) field (\w+) is a key$"',
        // eslint-disable-next-line
        expected: '^stream (\w+) field (\w+) is a key$',
      },
      {
        input: 'r#"I have cucumber in my belly"#',
        expected: 'I have cucumber in my belly',
      },
    ]

    cases.forEach(({ input, expected }) => {
      const node: TreeSitterSyntaxNode = {
        type: '',
        text: input,
        children: [],
        startPosition: { row: 0, column: 0 },
        endPosition: { row: 0, column: 0 },
      }
      assert.strictEqual(stringLiteral(node), expected)
    })
  })
})
