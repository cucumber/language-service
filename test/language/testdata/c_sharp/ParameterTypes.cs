using TechTalk.SpecFlow;
using uuid = System.String
using date = System.DateOnly

namespace StepDefinitions
{
	[Binding]
	public class ParameterTypes
	{
        [StepArgumentTransformation(@"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")]
        public uuid ConvertUuid(string s)
        {
          return s
        }

        [StepArgumentTransformation(@"\\d{4}-\\d{2}-\\d{2}")]
        public date ConvertDate(string s)
        {
          return s
        }
	}
}
