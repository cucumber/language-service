import io.cucumber.java.en.Given;

public class StepDefinitions {
    @Given("a {uuid}"  )
    void a_uuid(String uuid) {
    }

    @When("a {date}"  )
    void a_date(Date date) {
    }

    @Then("a {planet}"  )
    void a_date(Date date) {
    }

    @And("^a regexp$"  )
    void a_regexp() {
    }

    @But("an {undefined-parameter}"  )
    void an_undefined_parameter(Date date) {
    }

    @Given("the bee's knees"  )
    void the_bees_knees(Date date) {
    }
}
