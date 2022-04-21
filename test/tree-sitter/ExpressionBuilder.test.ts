import { CucumberExpression, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { readFile } from 'fs/promises'
import glob from 'glob'
import path from 'path'
import { ExpressionBuilder, LanguageName } from '../../src/index.js'
import { NodeParserAdapter } from '../../src/tree-sitter/NodeParserAdapter.js'

describe('ExpressionBuilder', () => {
  const expressionBuilder = new ExpressionBuilder(new NodeParserAdapter())

  for (const dir of glob.sync(`test/tree-sitter/testdata/*`)) {
    const language = path.basename(dir) as LanguageName
    it(`builds parameter types and expressions from ${language} source`, async () => {
      const contents = await Promise.all(glob.sync(`${dir}/**/*`).map((f) => readFile(f, 'utf-8')))
      const sources = contents.map((content) => ({
        language,
        content,
      }))
      const expressions = expressionBuilder.build(sources, [])
      assert.deepStrictEqual(
        expressions.map((e) =>
          e instanceof CucumberExpression ? e.source : (e as RegularExpression).regexp
        ),
        ['a {uuid}', 'a {date}', /^a regexp$/]
      )
    })
  }

  it('builds expressions from C# source', async () => {
    const stepdefs: Source = {
      language: 'c_sharp',
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
      language: 'c_sharp',
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
      ['I have {int} cukes in my belly', 'you have some time', 'a {iso-date}', 'a {date}']
    )
  })
})
