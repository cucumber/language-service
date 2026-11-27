import io.cucumber.java.ParameterType

class ParameterTypes {
    @ParameterType("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    fun uuid(uuid: String): String {
        return uuid
    }

    @ParameterType("\\d{4}-\\d{2}-\\d{2}")
    fun date(date: String) = SimpleDateFormat("yyyy-MM-dd").parse(date)

    @ParameterType("(jupiter|mars|tellus)")
    fun planet(planet: String): String = planet
}
