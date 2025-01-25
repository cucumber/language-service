import io.cucumber.scala.{EN, ScalaDsl, Scenario}
import org.junit.Assert._

class StepDefinitions extends ScalaDsl with EN {

  Given("a {uuid}") { (uuid: String) =>
  }

  When("a {date}") { (date: Date) =>
  }

  Then("a {planet}") { (date: Date) =>
  }

  Then("""^a regexp$""") { (x: Date) =>
  }

  But("an {undefined-parameter}") { (date: Date) =>
  }

  Given("the bee's knees") { (date: Date) =>
  }
}
