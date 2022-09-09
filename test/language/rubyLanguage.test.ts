import { StringOrRegExp } from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { toStringOrRegExp } from '../../src/language/rubyLanguage.js'
import { SourceAnalyzer } from '../../src/language/SourceAnalyzer.js'
import { Source, TreeSitterSyntaxNode } from '../../src/language/types.js'
import { WasmParserAdapter } from '../../src/tree-sitter-wasm/WasmParserAdapter.js'

describe('rubyLanguage', () => {
  it('should preserve regexp flags in step definitions', async () => {
    const parserAdapter = new WasmParserAdapter('dist')
    await parserAdapter.init()

    const source: Source<'ruby'> = {
      uri: 'hello.rb',
      languageName: 'ruby',
      content: `Given(/^a regexp$/i) {}`,
    }
    const expressions: StringOrRegExp[] = []
    const sourceAnalyser = new SourceAnalyzer(parserAdapter, [source])
    sourceAnalyser.eachStepDefinitionExpression((expr) => {
      expressions.push(expr)
    })
    assert.deepStrictEqual(expressions, [/^a regexp$/i])
  })

  it('should preserve', () => {
    const regex: TreeSitterSyntaxNode = {
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
    const result = toStringOrRegExp(regex)
    assert.deepStrictEqual(result, /^a regexp$/i)
  })
})
