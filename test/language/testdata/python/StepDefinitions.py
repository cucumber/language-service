from behave import step, given, when, then
from pytest_bdd import parsers
from pytest_bdd.parsers import parse


@step(parse("a {uuid}"))
def step_given(context, uuid):
    """Test PyPi parser syntax"""
    assert uuid


custom_types = {}
@given(parsers.parse("a {date}", custom_types))
def step_date(context, date):
    """Test extra parameter types"""
    assert date


@when(parse("a " + "{planet}"))
def step_planet(context, planet):
    """Test string concatenation"""
    assert planet


@then(parsers.parse("an {undefined-parameter}"))
def step_undef(context, planet):
    """Test undefined parameter type"""
    assert planet


@when("/^a regexp$/")
def step_re(context, expression):
    """Test regular expression"""
    assert expression


@then("the " + "bee's knees")
def step_bees(context, expression):
    """Test string concatenation"""
    assert expression
