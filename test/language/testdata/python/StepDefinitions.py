"""Port of givens for testdata."""
from behave import given
from pytest_bdd import given
import datetime
import re


@given("^a regexp$")
def step_re(expression):
    """Test Re."""
    assert expression

@given("^a regexp$")
def test_re(expression):
    """Test Re."""
    assert expression
