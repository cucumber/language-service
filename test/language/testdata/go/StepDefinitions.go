package main

import (
	"github.com/cucumber/godog"
)

func a_regexp() {}

func InitializeScenario(sc *godog.ScenarioContext) {
	sc.Step(`^a regexp$`, a_regexp)
}
