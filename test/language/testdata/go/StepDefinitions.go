package main

import (
	"github.com/cucumber/godog"
)

func a_regexp() {}

func InitializeScenario(ctx *godog.ScenarioContext) {
	ctx.Given(`^a regexp$`, a_regexp)
}
