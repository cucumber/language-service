import { CucumberExpression, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { ExpressionBuilder, Source, WasmUrls } from '../../src/index.js'

const wasmUrls: WasmUrls = {
  java: 'tree-sitter-java.wasm',
  typescript: 'tree-sitter-typescript.wasm',
  csharp: 'tree-sitter-c_sharp.wasm',
}

describe('ExpressionBuilder', () => {
  const expressionBuilder = new ExpressionBuilder()
  let initialized = false

  beforeEach(async () => {
    if (!initialized) {
      await expressionBuilder.init(wasmUrls)
      initialized = true
    }
  })

  it('builds expressions from Java source', async () => {
    const stepdefs: Source = {
      language: 'java',
      content: `
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
`,
    }

    const parameterTypes: Source = {
      language: 'java',
      content: `
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
`,
    }

    const expressions = expressionBuilder.build([stepdefs, parameterTypes], [])
    assert.deepStrictEqual(
      expressions.map((e) => e.source),
      ['I have {int} cukes in my belly', 'you have some time', 'a {iso-date}', 'a {date}']
    )
  })

  it('builds expressions from TypeScript source', async () => {
    const stepdefs: Source = {
      language: 'typescript',
      content: `
import { Given, Then, When } from '@cucumber/cucumber'

Given('a {uuid}', async function (uuid: string) {
})

When('a {date}', async function (date: Date) {
})

Then(/a regexp/, async function () {
})
`,
    }

    const parameterTypes: Source = {
      language: 'typescript',
      content: `
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
`,
    }
    const expressions = expressionBuilder.build([stepdefs, parameterTypes], [])
    assert.deepStrictEqual(
      expressions.map((e) =>
        e instanceof CucumberExpression ? e.source : (e as RegularExpression).regexp
      ),
      ['a {uuid}', 'a {date}', /a regexp/]
    )
  })

  it('builds expressions from C# source', async () => {
    const stepdefs: Source = {
      language: 'csharp',
      content: `
namespace Bowling.SpecFlow.StepDefinitions
{
    [Binding]
    public class BowlingSteps
    {
        private readonly BowlingDriver _bowlingDriver;

        public BowlingSteps(BowlingDriver bowlingDriver)
        {
            _bowlingDriver = bowlingDriver;
        }

        [Given(@"a new bowling game")]
        public void GivenANewBowlingGame()
        {
            _bowlingDriver.NewGame();
        }

        [When(@"all of my balls are landing in the gutter")]
        public void WhenAllOfMyBallsAreLandingInTheGutter()
        {
            _bowlingDriver.Roll(0, 20);
        }

        [Then(@"my total score should be (\\d+)")]
        public void ThenMyTotalScoreShouldBe(int score)
        {
            _bowlingDriver.CheckScore(score);
        }

        [StepDefinition(@"I roll (\\d+) and (\\d+)")]
        public void WhenIRoll(int pins1, int pins2)
        {
            _bowlingDriver.Roll(pins1, pins2, 1);
        }

        [When(@"I roll the following series:(.*)")]
        public void WhenIRollTheFollowingSeries(string series)
        {
            _bowlingDriver.RollSeries(series);
        }

        [When(@"I roll")]
        public void WhenIRoll(Table rolls)
        {
            _bowlingDriver.RollSeries(rolls);
        }
    }
}
`,
    }

    const parameterTypes: Source = {
      language: 'typescript',
      content: `
[Binding]
public class Transforms
{
    [StepArgumentTransformation(@"in (\\d+) days?")]
    public DateTime InXDaysTransform(int days)
    {
      return DateTime.Today.AddDays(days);
    }

    [StepArgumentTransformation]
    public XmlDocument XmlTransform(string xml)
    {
       XmlDocument result = new XmlDocument();
       result.LoadXml(xml);
       return result;
    }
}`,
    }

    const expressions = expressionBuilder.build([stepdefs, parameterTypes], [])
    assert.deepStrictEqual(
      expressions.map((e) => e.source),
      []
    )
  })
})
