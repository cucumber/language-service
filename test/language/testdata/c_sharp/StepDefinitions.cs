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

		[When("a {uuid}")]
		public void AUniqueID(string uuid) 
		{
		}

		[Then("a {date}")]
		public void ADate(Date date) 
		{
		}

		[Then("an {undefined-parameter}")]
		public void AnUndefinedParameter(Date date) 
		{
		}
	}
}
