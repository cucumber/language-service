import io.cucumber.java.en.Given;

public class StepDefinitions {
    @Given("a {uuid}"  )
    void a_uuid(String uuid) {
    }

    @Given("a {date}"  )
    void a_date(Date date) {
    }

    @Given("^a regexp$"  )
    void a_regexp() {
    }

    @Given("an {undefined-parameter}"  )
    void a_date(Date date) {
    }
}
