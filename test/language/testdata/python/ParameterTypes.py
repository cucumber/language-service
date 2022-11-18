from datetime import datetime
from cucumber_expressions.parameter_type import ParameterType

ParameterType(
    name="uuid",
    regexp="/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/",
    transformer=lambda x: x,
)

ParameterType(
    name="date",
    regexp="/\d{4}-\d{2}-\d{2}/",
    transformer=lambda x: datetime.datetime(x),
)

ParameterType(
    name="planet",
    regexp="jupiter|mars|tellus",
    transformer=lambda x: x,
)
