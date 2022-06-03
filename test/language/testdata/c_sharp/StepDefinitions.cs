using TechTalk.SpecFlow;

namespace StepDefinitions
{
    [Binding]
    public class BowlingSteps
    {
		[Given(@"^a regexp$")]
        public void ARegexp() 
		{
        }

		[When(@"I have Regex parameters like (\d+) and (\d+)")]
		public void WhenIHaveRegexParametersLikeAnd(int pins1, int pins2)
		{
		}

		[Then("a {string} cucumber expression {string}")]
		public void ThenACucumberExpression(string s, string s2)
		{
		}

		[Then(@"I have a verbatim string")]
		public void ThenIHaveAVerbatimString()
		{
		}
    }
}
