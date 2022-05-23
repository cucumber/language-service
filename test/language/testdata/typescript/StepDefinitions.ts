import { Given } from '@cucumber/cucumber'
import assert from 'assert'

Given('a {uuid}', async function (uuid: string) {
  assert(uuid)
})

Given('a {date}', async function (date: Date) {
  assert(date)
})

Given(/^a regexp$/, async function () {
  assert(true)
})

Given('an {undefined-parameter}', async function (date: Date) {
  assert(date)
})
