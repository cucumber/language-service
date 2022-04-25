using TechTalk.SpecFlow;

namespace Bowling.SpecFlow.StepDefinitions
{
    [Binding]
    public class BowlingSteps
    {
        public BowlingSteps() { }

        [Given(@"a new bowling game")]
        public void GivenANewBowlingGame()
        {
        }

        [When(@"all of my balls are landing in the gutter")]
        public void WhenAllOfMyBallsAreLandingInTheGutter()
        {
        }

        [Then(@"my total score should be (\d+)")]
        public void ThenMyTotalScoreShouldBe(int score)
        {
        }

        [StepDefinition(@"I roll (\d+) and (\d+)")]
        public void WhenIRoll(int pins1, int pins2)
        {
        }

        [When(@"I roll the following series:(.*)")]
        public void WhenIRollTheFollowingSeries(string series)
        {
        }

        [When(@"I roll")]
        public void WhenIRoll(Table rolls)
        {
        }
    }
}
