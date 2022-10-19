"""Port of givens for testdata."""
from behave import given
import datetime
import re


@given("a {uuid}")
def step_given(context, uuid):
    assert uuid


@given("a {date}")
def step_date(context, date):
    assert date


@given("a {planet}")
def step_planet(context, planet):
    assert planet


@given("an {undefined-parameter}")
def step_undef(context, planet):
    assert planet


@given("/^a regexp$/")
def step_re(context, expression):
    """Test Re."""
    assert expression


@given("the bee's knees")
def step_bees(context, expression):
    """Test Re."""
    assert expression
