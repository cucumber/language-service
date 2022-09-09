import { StringOrRegExp } from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { Source } from '../../src'
import { SourceAnalyzer } from '../../src/language/SourceAnalyzer.js'
import { WasmParserAdapter } from '../../src/tree-sitter-wasm/WasmParserAdapter.js'

describe('rubyLanguage', () => {
  it('should preserve regexp flags in step defnitions', async () => {
    const parserAdapter = new WasmParserAdapter('dist')
    await parserAdapter.init()

    const source: Source<'ruby'> = {
      uri: 'hello.rb',
      languageName: 'ruby',
      content: `Given(/^a regexp$/) {}`,
    }
    const expressions: StringOrRegExp[] = []
    const sourceAnalyser = new SourceAnalyzer(parserAdapter, [source])
    sourceAnalyser.eachStepDefinitionExpression((expr) => {
      expressions.push(expr)
    })
    assert.deepStrictEqual(expressions, [/^a regexp$/])
  })
})
