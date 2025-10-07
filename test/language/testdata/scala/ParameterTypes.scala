class ParameterTypes extends ScalaDsl with EN {

    ParameterType("uuid", "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}") { uuid: String =>
        uuid
    }

    ParameterType("date", "\\d{4}-\\d{2}-\\d{2}") { date: String =>
        LocalDate.parse(date)
    }

    ParameterType("planet", "(jupiter|mars|tellus)") { planet: String =>
        planet
    }
}
