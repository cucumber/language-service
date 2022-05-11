import { CucumberExpression, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { readFile } from 'fs/promises'
import glob from 'glob'
import path from 'path'

import { ExpressionBuilder, LanguageName } from '../../src/index.js'
import { ParserAdapter, Source } from '../../src/tree-sitter/types.js'
import { NodeParserAdapter } from '../../src/tree-sitter-node/NodeParserAdapter.js'
import { WasmParserAdapter } from '../../src/tree-sitter-wasm/WasmParserAdapter.js'

const parameterTypeSupport: Set<LanguageName> = new Set(['typescript', 'java', 'ruby'])

function defineContract(makeParserAdapter: () => ParserAdapter) {
  let expressionBuilder: ExpressionBuilder
  beforeEach(async () => {
    const parserAdpater = await makeParserAdapter()
    await parserAdpater.init()
    expressionBuilder = new ExpressionBuilder(parserAdpater)
  })

  for (const dir of glob.sync(`test/tree-sitter/testdata/*`)) {
    const language = path.basename(dir) as LanguageName
    // if (language !== 'ruby') {
    //   continue
    // }
    it(`builds parameter types and expressions from ${language} source`, async () => {
      const contents = await Promise.all(glob.sync(`${dir}/**/*`).map((f) => readFile(f, 'utf-8')))
      const sources: Source<LanguageName>[] = contents.map((content, i) => ({
        language,
        content,
        path: `dummy-${i}`,
      }))
      const result = expressionBuilder.build(sources, [])
      assert.deepStrictEqual(
        result.expressions.map((e) =>
          e instanceof CucumberExpression ? e.source : (e as RegularExpression).regexp
        ),
        parameterTypeSupport.has(language) ? ['a {uuid}', 'a {date}', /^a regexp$/] : [/^a regexp$/]
      )
    })
  }
}

describe('ExpressionBuilder', () => {
  context('with NodeParserAdapter', () => {
    defineContract(() => new NodeParserAdapter())
  })

  context('with WasmParserAdapter', () => {
    defineContract(() => new WasmParserAdapter('dist'))
  })
})
