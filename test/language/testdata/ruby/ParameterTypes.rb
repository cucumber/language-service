require 'date'

ParameterType(
  name:        'uuid',
  regexp:      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
  transformer: ->(s) { s }
)

ParameterType(
  name:        'date',
  regexp:      /\d{4}-\d{2}-\d{2}/,
  transformer: ->(s) { Date.parse(s) }
)

ParameterType(
  name:        'planet',
  regexp:      ['jupiter', 'mars', 'tellus'],
  transformer: ->(s) { s }
)
