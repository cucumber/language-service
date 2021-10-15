import assert from 'assert'
import Parser from 'web-tree-sitter'

import { buildExpressionsFromJava } from '../../src/tree-sitter/buildExpressionsFromJava.js'

describe('buildExpressionsFromJava', () => {
  let parser: Parser
  let language: Parser.Language

  beforeEach(async () => {
    await Parser.init()
    parser = new Parser()
    language = await Parser.Language.load('tree-sitter-java.wasm')
    parser.setLanguage(language)
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

    const expressions = buildExpressionsFromJava(parser, language, [stepdefs, parameterTypes])
    assert.deepStrictEqual(
      expressions.map((e) => e.source),
      ['I have {int} cukes in my belly', 'you have some time', 'a {iso-date}', 'a {date}']
    )
  })
})
