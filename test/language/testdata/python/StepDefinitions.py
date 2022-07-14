"""Port of givens for testdata."""
from behave import given
import datetime
import re


@given("^a regexp$")
def step_re(expression):
    """Test Re."""
    assert expression
