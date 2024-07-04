package main

import (
	"github.com/cucumber/godog"
)

func a_regexp() {}

func InitializeScenario(ctx *godog.ScenarioContext) {
	ctx.Given(`^a regexp$`, a_regexp)
}

func (s suite) Steps(sc *godog.ScenarioContext) {
    sc.Given(`^I test this change$`, a_regexp)
}
