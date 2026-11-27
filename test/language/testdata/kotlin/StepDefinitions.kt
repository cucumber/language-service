import io.cucumber.java.en.Given
import io.cucumber.java.en.Then
import io.cucumber.java.en.When
import io.cucumber.java.en.But

class StepDefinitions {
    @Given("a {uuid}")
    fun aUuid(uuid: String) {
    }

    @When("a {date}")
    fun aDate(date: Date) {
    }

    @Then("a {planet}")
    fun aPlanet(planet: String) {
    }

    @Then("""^a regexp$""")
    fun aRegexp() {
    }

    @But("an {undefined-parameter}")
    fun anUndefinedParameter(x: Date) = Unit

    @Given("the bee's knees")
    fun theBeesKnees() {
    }
}
