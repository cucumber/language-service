using TechTalk.SpecFlow;

namespace StepDefinitions
{
	[Binding]
	public class Steps
	{
		[Given("a {uuid}")]
		public void AUniqueID(string uuid)
		{
		}

		[Given("a {date}")]
		public void ADate(Date date)
		{
		}

		[Given("a {planet}")]
		public void APlanet(string planet)
		{
		}

		[Given(@"^a regexp$")]
		public void ARegexp()
		{
		}

		[Given("an {undefined-parameter}")]
		public void AnUndefinedParameter(Date date)
		{
		}

		[Given("the bee's knees")]
		public void TheBeesKnees()
		{
		}
	}
}
