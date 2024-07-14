import cucumber, { Given } from '@cucumber/cucumber'
import assert from 'assert'
import React from 'react'

const dummyJsx = <span>Hello</span>

Given('a {uuid}', async function (uuid) {
  assert(uuid)
})

Given('a {date}', async function (date) {
  assert(date)
})

Given('a {planet}', async function (planet) {
  assert(planet)
})

Given(/^a regexp$/, async function () {
  assert(true)
})

Given('an {undefined-parameter}', async function (date) {
  assert(date)
})

;(0, Given)("the bee's knees", async function () {
  assert(true)
})

;(0, cucumber.Given)('a compiled format', async function () {
  assert(true)
})
