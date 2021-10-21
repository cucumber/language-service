import assert from 'assert'
import Parser from 'web-tree-sitter'

import { buildExpressions, javaQueries, typeScriptQueries } from '../../src/index.js'
import { CucumberExpression, RegularExpression } from '@cucumber/cucumber-expressions'

describe('buildExpressions', () => {
  let parser: Parser
  let java: Parser.Language
  let typescript: Parser.Language

  beforeEach(async () => {
    await Parser.init()
    if (!parser) parser = new Parser()
    if (!java) java = await Parser.Language.load('tree-sitter-java.wasm')
    if (!typescript) typescript = await Parser.Language.load('tree-sitter-typescript.wasm')
  })

  it('builds expressions from Java source', async () => {
    const stepdefs = `
class StepDefinitions {
    @Given("I have {int} cukes in my belly"  )
    void method1() {
    }

    @When("you have some time")
    void method2() {
    }

    @Then("a {iso-date}")
    void method3() {
    }

    @Then("a {date}")
    void method4() {
    }
}
`

    const parameterTypes = `
class ParameterTypes {
    @ParameterType("(?:.*) \\\\d{1,2}, \\\\d{4}")
    public Date date(String date) throws ParseException {
        return getDateInstance(MEDIUM, ENGLISH).parse(date);
    }

    @ParameterType(name = "iso-date", value = "\\\\d{4}-\\\\d{2}-\\\\d{2}")
    public Date isoDate(String date) throws ParseException {
        return new SimpleDateFormat("yyyy-mm-dd").parse(date);
    }
}
`

    const expressions = buildExpressions(parser, java, javaQueries, [stepdefs, parameterTypes])
    assert.deepStrictEqual(
      expressions.map((e) => e.source),
      ['I have {int} cukes in my belly', 'you have some time', 'a {iso-date}', 'a {date}']
    )
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

    const expressions = buildExpressions(parser, typescript, typeScriptQueries, [
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
