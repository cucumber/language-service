class ParameterTypes {
    @ParameterType("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    public String uuid(String uuid) {
        return uuid;
    }

    @ParameterType(name = "date", value = "\\d{4}-\\d{2}-\\d{2}")
    public Date isoDate(String date) throws ParseException {
        return new SimpleDateFormat("yyyy-mm-dd").parse(date);
    }
}
