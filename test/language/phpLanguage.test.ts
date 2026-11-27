import assert from 'node:assert'

import { behatifyStep } from '../../src/language/phpLanguage.js'

describe('phpLanguage', () => {
  it('should handle behat step definition', () => {
    const cases = [
      {
        input: '@Given Hello world',
        output: /Hello world/,
      },
      {
        input: '@When Hello :world',
        output: /Hello ([\S]+|"[^"]+")/,
      },
      {
        input: '@Then there is a :arg1, which costs £:arg2',
        output: /there is a ([\S]+|"[^"]+"), which costs £([\S]+|"[^"]+")/,
      },
      {
        input: '@Given /^there (?:is|are) (\\d+) monsters?$/',
        output: /^there (?:is|are) (\d+) monsters?$/,
      },
      {
        input: '@Given /^Something (.*)$/i',
        output: /^Something (.*)$/i,
      },
    ]
    cases.forEach((c) => {
      const result = behatifyStep(c.input)
      assert(result instanceof RegExp)
      assert.equal(result.toString(), c.output.toString())
    })
  })
})
