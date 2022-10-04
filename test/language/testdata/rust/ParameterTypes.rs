use cucumber::Parameter;

#[derive(Debug, Default, Parameter)]
#[param(name = "planet", regex = "jupiter|mars|tellus")]
struct Planet(String)


#[derive(Debug, Default, Parameter)]
#[param(name = "uuid", regex = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")]
struct Uuid(String)

#[derive(Debug, Default, Parameter)]
#[param(name = "date", regex = "\\d{4}-\\d{2}-\\d{2}")]
struct Date(chrono::DateTime)
