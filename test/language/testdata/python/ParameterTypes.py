from datetime import datetime

from cucumber_expressions.parameter_type import ParameterType

ParameterType(
    name="uuid",
    regexp="/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/",
    transformer=lambda x: x,
)

ParameterType(
    name="date",
    transformer=lambda x: datetime.datetime(x),
    regexp="/\d{4}-\d{2}-\d{2}/",
)

ParameterType(
    transformer=lambda x: x,
    regexp="jupiter|mars|tellus",
    name="planet",
)
