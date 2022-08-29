using System;
using BddWithSpecFlow.GeekPizza.Web.DataAccess;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TechTalk.SpecFlow;
using uuid = System.String;
using planet = System.String;
using date = System.DateOnly;

namespace BddWithSpecFlow.GeekPizza.Specs.Support
{
    [Binding]
    public class Conversions
    {
        // Define the {uuid} and {date} parameter types required for the generic tests

        [StepArgumentTransformation(@"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")]
        public uuid ConvertUuid(string s)
        {
          return s
        }

        [StepArgumentTransformation(@"(jupiter|mars|tellus)")]
        public planet ConvertPlanet(string s)
        {
          return s
        }

        [StepArgumentTransformation(@"\d{4}-\d{2}-\d{2}")]
        public date ConvertDate(string s)
        {
          return s
        }

        // Define some additional parameter types for c_sharp specific tests.
        [StepArgumentTransformation]
        public WithoutExpression ConvertWithoutExpression(string s) {
            return new WithoutExpression(s)
        }

        // The rest is copied from https://github.com/specsolutions/202200607-EuroSTAR-AutomationWithSpecFlow/blob/main/Solutions/D2/BddWithSpecFlow.GeekPizza.API.Specs/Support/Conversions.cs

        // DATE

        [StepArgumentTransformation("today")]
        public DateTime ConvertToday()
        {
            return DateTime.Today;
        }

        [StepArgumentTransformation("tomorrow")]
        public DateTime ConvertTomorrow()
        {
            return DateTime.Today.AddDays(1);
        }

        [StepArgumentTransformation("(.*) days later")]
        public DateTime ConvertDaysLater(int days)
        {
            return DateTime.Today.AddDays(days);
        }

        // TIME

        [StepArgumentTransformation(@"(\d+):(\d+)")]
        public TimeSpan ConvertTimeSpan(int hours, int minutes)
        {
            return new TimeSpan(hours, minutes, 0);
        }

        [StepArgumentTransformation("noon")]
        public TimeSpan ConvertNoon()
        {
            return TimeSpan.FromHours(12);
        }

        [StepArgumentTransformation(@"(\d+)(am|pm)")]
        public TimeSpan ConvertTimeSpanAmPm(int hours, string ampm)
        {
            if (ampm == "pm" && hours < 12) hours += 12;
            if (ampm == "am" && hours == 12) hours -= 12;
            return new TimeSpan(hours, 0, 0);
        }
    }
}
