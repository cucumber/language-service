import io.cucumber.java.en.And
import io.cucumber.java.en.But
import io.cucumber.java.en.Given
import io.cucumber.java.en.Then
import io.cucumber.java.en.When

class StepDefinitions {
    @Given("a {uuid}")
    fun aUuid(uuid: String) {
    }

    @When(value = "a {date}")
    fun aDate(date: Date) {
    }

    @Then("a {planet}")
    fun aPlanet(planet: String) {
    }

    @Then("^a regexp$")
    fun aRegexp() {
    }

    @But("an {undefined-parameter}")
    fun anUndefinedParameter(x: Date) = Unit

    @And("the bee's knees")
    fun theBeesKnees() {
    }
}
