"""Parameter Type."""
from datetime import datetime


ParameterType(
    name="uuid",
    regexp=r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
    transformer=lambda x: x
)


ParameterType(
    name="date",
    regexp=r"\d{4}-\d{2}-\d{2}",
    transformer=lambda x: datetime.strptime(x, "%Y-%m-%d")
)
