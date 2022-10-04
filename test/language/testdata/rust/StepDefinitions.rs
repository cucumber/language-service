use cucumber::{given, then, when, World};


#[derive(Debug, Default, World)]
struct StepDefinitions {}

#[given(expr = "a {uuid}")]
fn a_uuid(world: &mut StepDefinitions, uuid: String) {}

#[given(expr = "a {date}")]
fn a_date(world: &mut StepDefinitions,date: chrono::DateTime) {}

#[given("a {planet}")]
fn a_date(world: &mut StepDefinitions,date: chrono::DateTime) {}

#[given(regex = r"^a regexp$")]
fn a_regexp(world: &mut StepDefinitions) {}

#[given(expr = "an {undefined-parameter}")]
fn an_undefined_parameter(world: &mut StepDefinitions, date: chrono::DateTime)

#[given("the bee's knees")]
fn the_bees_knees(world: &mut StepDefinitions) {}