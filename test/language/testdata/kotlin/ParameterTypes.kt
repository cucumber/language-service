import io.cucumber.java.ParameterType

class ParameterTypes {
    @ParameterType("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    fun uuid(uuid: String): String {
        return uuid
    }

    @ParameterType(name = "date", value = "\\d{4}-\\d{2}-\\d{2}")
    fun isoDate(date: String) = SimpleDateFormat("yyyy-MM-dd").parse(date)

    @ParameterType(value = "(jupiter|mars|tellus)", name = "planet")
    fun celestialBody(planet: String): String = planet

    @ParameterType("""[A-Z]\w+""")
    fun shout(word: String): String = word
}
