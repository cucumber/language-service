import assert from 'assert'

import { stringLiteral, stripLineContinuation } from '../../src/language/rustLanguage.js'
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

  it('should strip line continuations from expressions', () => {
    const cases = [
      {
        // Single line continuation
        input: '"Line \\\n  continuation"',
        expected: '"Line continuation"',
      },
      {
        input: '"Multiple \\\n  line \\\n  continuations"',
        expected: '"Multiple line continuations"',
      },
      {
        // Continuation with consecutive new lines
        input: '"Continuation with \\\n\n  consecutive new lines"',
        expected: '"Continuation with consecutive new lines"',
      },
      {
        // No space before continuation
        input: '"No space\\\n  before continuation"',
        expected: '"No spacebefore continuation"',
      },
      {
        // Multiple spaces before continuation
        input: '"Two spaces  \\\n  before continuation"',
        expected: '"Two spaces  before continuation"',
      },
      {
        // Line continuation with extra space
        input: '"this \\ line \\\nshould too"',
        expected: '"this \\ line should too"',
      },
      {
        // Ends with line continuation
        input: '"Ends with continuation\\\n"',
        expected: '"Ends with continuation"',
      },
      {
        // Ends with line continuation and whitespace
        input: '"Ends with continuation and whitespace\\\n "',
        expected: '"Ends with continuation and whitespace"',
      },
    ]

    cases.forEach(({ input, expected }) => {
      assert.strictEqual(stripLineContinuation(input), expected)
    })
  })

  it('should not strip invalid line continuations from expressions', () => {
    const cases = [
      {
        // Space after continuation but before new line
        input: '"Space after continuation \\ \n  but before new line"',
        expected: '"Space after continuation \\ \n  but before new line"',
      },
      {
        // Ends with escape character
        input: '"Escaped backslash \\"',
        expected: '"Escaped backslash \\"',
      },
    ]

    cases.forEach(({ input, expected }) => {
      assert.strictEqual(stripLineContinuation(input), expected)
    })
  })
})
