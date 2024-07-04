import { CucumberExpression, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { readFile } from 'fs/promises'
import { glob } from 'glob'
import { basename, resolve } from 'path'

import { ExpressionBuilder, LanguageName } from '../../src/index.js'
import { ParserAdapter, Source } from '../../src/language/types.js'
import { NodeParserAdapter } from '../../src/tree-sitter-node/NodeParserAdapter.js'
import { WasmParserAdapter } from '../../src/tree-sitter-wasm/WasmParserAdapter.js'

// List languages that support Cucumber Expressions here
const cucumberExpressionsSupport: Set<LanguageName> = new Set([
  'c_sharp',
  'java',
  'javascript',
  'python',
  'ruby',
  'rust',
  'tsx',
])

function defineContract(makeParserAdapter: () => ParserAdapter) {
  let expressionBuilder: ExpressionBuilder
  beforeEach(async () => {
    const parserAdpater = makeParserAdapter()
    await parserAdpater.init()
    expressionBuilder = new ExpressionBuilder(parserAdpater)
  })

  for (const dir of glob.sync(`test/language/testdata/*`)) {
    const languageName = basename(dir) as LanguageName

    if (languageName === 'c_sharp') {
      it(`builds parameter type from [StepArgumentTransformation] without expression`, async () => {
        const sources = await loadSources(dir, languageName)
        const result = expressionBuilder.build(sources, [])

        const regexpStrings = result.parameterTypeLinks.find(
          (l) => l.parameterType.name === 'WithoutExpression'
        )?.parameterType?.regexpStrings
        assert.deepStrictEqual(regexpStrings, ['.*'])
      })

      it(`builds parameter type from multiple [StepArgumentTransformation] with the same return type`, async () => {
        const sources = await loadSources(dir, languageName)
        const result = expressionBuilder.build(sources, [])

        const regexpStrings = result.parameterTypeLinks.find(
          (l) => l.parameterType.name === 'DateTime'
        )?.parameterType?.regexpStrings
        assert.deepStrictEqual(regexpStrings, ['today', 'tomorrow', '(.*) days later'])
      })
    }
    // if (languageName !== 'c_sharp') continue

    it(`builds parameter types and expressions from ${languageName} source`, async () => {
      const sources = await loadSources(dir, languageName)
      const result = expressionBuilder.build(sources, [
        {
          regexp: '.*',
          name: 'int',
        },
      ])

      // verify that the targetSelectionRange is inside the targetRange
      for (const link of result.expressionLinks.map((l) => l.locationLink)) {
        assert(
          link.targetSelectionRange.start.line > link.targetRange.start.line ||
            link.targetSelectionRange.start.character >= link.targetRange.start.character
        )
        assert(
          link.targetSelectionRange.end.line < link.targetRange.end.line ||
            link.targetSelectionRange.end.character <= link.targetRange.end.character
        )
      }
      const expressions = result.expressionLinks.map(({ expression }) =>
        expression instanceof CucumberExpression
          ? expression.source
          : (expression as RegularExpression).regexp
      )
      const errors = result.errors.map((e) => e.message)
      if (cucumberExpressionsSupport.has(languageName)) {
        assert.deepStrictEqual(expressions, [
          'a {uuid}',
          'a {date}',
          'a {planet}',
          /^a regexp$/,
          "the bee's knees",
        ])
        assert.deepStrictEqual(errors, [
          'There is already a parameter type with name int',
          `This Cucumber Expression has a problem at column 4:

an {undefined-parameter}
   ^-------------------^
Undefined parameter type 'undefined-parameter'.
Please register a ParameterType for 'undefined-parameter'`,
        ])

        // Verify that the extracted expressions actually work
        let matched = false
        for (const expressionLink of result.expressionLinks) {
          const match = expressionLink.expression.match('a 2020-12-24')
          if (match) {
            assert.strictEqual(match[0].getValue(undefined), '2020-12-24')
            matched = true
          }
        }
        assert(matched, 'The generated expressions did not match parameter type {date}')
      } else {
        assert.deepStrictEqual(expressions, [/^a regexp$/, /^I test this change$/])
        assert.deepStrictEqual(errors, ['There is already a parameter type with name int'])
      }
    })
  }
}

async function loadSources(
  dir: string,
  languageName: LanguageName
): Promise<Source<LanguageName>[]> {
  return Promise.all(
    glob.sync(`${dir}/**/*`).map((path) => {
      return readFile(path, 'utf-8').then((content) => ({
        languageName,
        content,
        uri: `file://${resolve(path)}`,
      }))
    })
  )
}

describe('ExpressionBuilder', () => {
  context('with NodeParserAdapter', () => {
    defineContract(() => new NodeParserAdapter())
  })
  context('with WasmParserAdapter', () => {
    defineContract(() => new WasmParserAdapter('dist'))
  })
})
