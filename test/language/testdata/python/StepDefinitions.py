"""Port of givens for testdata."""
from behave import given
import datetime
import re


@given("a {uuid}")
def step_uuid(uuid: str):
    """Test UUID."""
    assert(uuid)


@given("a {date}")
def step_date(date: datetime):
    """Test Datetime."""
    assert(date)


@given("an {undefined-parameter}")
def step_undef(date: datetime):
    """Test Undefined."""
    assert(date)


@given("/^a regexp$/")
def step_re(expression):
    """Test Re."""
    assert(expression)
