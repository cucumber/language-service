import { CucumberExpression, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { readFile } from 'fs/promises'
import glob from 'glob'
import { basename } from 'path'

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
    const language = basename(dir) as LanguageName
    // if (language !== 'ruby') {
    //   continue
    // }
    it(`builds parameter types and expressions from ${language} source`, async () => {
      const sources: Source<LanguageName>[] = await Promise.all(
        glob.sync(`${dir}/**/*`).map((path) => {
          return readFile(path, 'utf-8').then((content) => ({
            language,
            content,
            path,
          }))
        })
      )
      const result = expressionBuilder.build(sources, [{ regexp: '.*', name: 'int' }])
      const expressions = result.expressionLinks.map(({ expression }) =>
        expression instanceof CucumberExpression
          ? expression.source
          : (expression as RegularExpression).regexp
      )
      const errors = result.errors.map((e) => e.message)
      if (parameterTypeSupport.has(language)) {
        assert.deepStrictEqual(expressions, ['a {uuid}', 'a {date}', /^a regexp$/])
        assert.deepStrictEqual(errors, [
          'There is already a parameter type with name int',
          `This Cucumber Expression has a problem at column 4:

an {undefined-parameter}
   ^-------------------^
Undefined parameter type 'undefined-parameter'.
Please register a ParameterType for 'undefined-parameter'`,
        ])
      } else {
        assert.deepStrictEqual(expressions, [/^a regexp$/])
        assert.deepStrictEqual(errors, ['There is already a parameter type with name int'])
      }
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
