import io.cucumber.java.en.Given;

public class StepDefinitions {
    @Given("a {uuid}"  )
    void a_uuid(String uuid) {
    }

    @Given("a {date}"  )
    void a_date(Date date) {
    }

    @Given("a {planet}"  )
    void a_date(Date date) {
    }

    @Given("^a regexp$"  )
    void a_regexp() {
    }

    @Given("an {undefined-parameter}"  )
    void an_undefined_parameter(Date date) {
    }

    @Given("the bee's knees"  )
    void the_bees_knees(Date date) {
    }
}
