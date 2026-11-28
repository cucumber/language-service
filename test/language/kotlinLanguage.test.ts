import assert from 'node:assert'

import { ExpressionBuilder } from '../../src/language/ExpressionBuilder.js'
import { stringLiteral } from '../../src/language/kotlinLanguage.js'
import type { Source, TreeSitterSyntaxNode } from '../../src/language/types.js'
import { WasmParserAdapter } from '../../src/WasmParserAdapter.js'

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
      '"^it is (?i)ok$"': '^it is ok$',
      '"""^it is (?i)ok$"""': '^it is ok$',
    }
    for (const [input, expected] of Object.entries(cases)) {
      it(`reads ${input}`, () => {
        assert.strictEqual(stringLiteral(node(input)), expected)
      })
    }
  })

  describe('step definitions', () => {
    let expressionBuilder: ExpressionBuilder
    before(async () => {
      const parserAdapter = new WasmParserAdapter('dist')
      await parserAdapter.init()
      expressionBuilder = new ExpressionBuilder(parserAdapter)
    })

    function expressionsIn(content: string): readonly string[] {
      const source: Source<'kotlin'> = { languageName: 'kotlin', content, uri: 'file:///Test.kt' }
      const result = expressionBuilder.build([source], [])
      assert.deepStrictEqual(result.errors, [])
      return result.expressionLinks.map(({ expression }) => expression.source)
    }

    const found: Record<string, [string, string[]]> = {
      'a ^-only anchor': ['class A {\n@Given("^starts with")\nfun f() {}\n}', ['^starts with']],
      'a $-only anchor': ['class A {\n@Given("ends with\\$")\nfun f() {}\n}', ['ends with$']],
      'a case-insensitive flag in a regexp': [
        'class A {\n@Given("^it is (?i)ok$")\nfun f() {}\n}',
        ['^it is ok$'],
      ],
      'a fully qualified annotation': [
        'class A {\n@io.cucumber.java.en.Given("qualified")\nfun f() {}\n}',
        ['qualified'],
      ],
      'stacked annotations': [
        'class A {\n@Given("one")\n@When("two")\nfun f() {}\n}',
        ['one', 'two'],
      ],
      'a top-level function': ['@Given("top level")\nfun f() {}', ['top level']],
    }
    for (const [description, [content, expected]] of Object.entries(found)) {
      it(`finds step definitions with ${description}`, () => {
        assert.deepStrictEqual(expressionsIn(content), expected)
      })
    }

    const ignored: Record<string, string> = {
      'an unrelated annotation': 'class A {\n@Deprecated("not a step")\nfun f() {}\n}',
      'an annotation that only starts with a step keyword':
        'class A {\n@GivenX("not a step")\nfun f() {}\n}',
      'a step annotation on a class': '@Given("not a step")\nclass A {}',
      'a parameter type annotation on a class': '@ParameterType("a|b")\nclass A {}',
    }
    for (const [description, content] of Object.entries(ignored)) {
      it(`ignores ${description}`, () => {
        assert.deepStrictEqual(expressionsIn(content), [])
      })
    }
  })
})
