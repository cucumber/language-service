import { CucumberExpression, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import Parser from 'web-tree-sitter'

import { buildExpressions, typeScriptQueries } from '../../src/index.js'

describe('buildExpressionsFromTypeScript', () => {
  let parser: Parser
  let language: Parser.Language

  beforeEach(async () => {
    await Parser.init()
    parser = new Parser()
    language = await Parser.Language.load('tree-sitter-typescript.wasm')
    parser.setLanguage(language)
  })

  it('builds expressions from TypeScript source', async () => {
    const stepdefs = `
import { Given, Then, When } from '@cucumber/cucumber'

Given('a {uuid}', async function (uuid: string) {
})

When('a {date}', async function (date: Date) {
})

Then(/a regexp/, async function () {
})
`

    const parameterTypes = `
import { defineParameterType } from '@cucumber/cucumber'

defineParameterType({
  name: 'uuid',
  regexp: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
  transformer: (uuid: string) => uuid,
})

defineParameterType({
  name: 'date',
  regexp: /\\d{4}-\\d{2}-\\d{2}/,
  transformer: (name: string) => new Date(name),
})
`

    const expressions = buildExpressions(parser, language, typeScriptQueries, [
      stepdefs,
      parameterTypes,
    ])
    assert.deepStrictEqual(
      expressions.map((e) =>
        e instanceof CucumberExpression ? e.source : (e as RegularExpression).regexp
      ),
      ['a {uuid}', 'a {date}', /a regexp/]
    )
  })
})
