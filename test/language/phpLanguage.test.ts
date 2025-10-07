import assert from 'assert'

import { behatifyStep } from '../../src/language/phpLanguage.js'

describe('phpLanguage', () => {
  it('should handle behat step definition', () => {
    const cases = [
      {
        input: '@Given Hello world',
        output: RegExp('Hello world'),
      },
      {
        input: '@When Hello :world',
        output: RegExp('Hello ([\\S]+|"[^"]+")'),
      },
      {
        input: '@Then there is a :arg1, which costs £:arg2',
        output: RegExp('there is a ([\\S]+|"[^"]+"), which costs £([\\S]+|"[^"]+")'),
      },
      {
        input: '@Given /^there (?:is|are) (\\d+) monsters?$/',
        output: RegExp('^there (?:is|are) (\\d+) monsters?$'),
      },
      {
        input: '@Given /^Something (.*)$/i',
        output: RegExp('^Something (.*)$', 'i'),
      },
    ]
    cases.forEach(function (c) {
      const result = behatifyStep(c.input)
      assert(result instanceof RegExp)
      assert.equal(result.toString(), c.output.toString())
    })
  })
})
