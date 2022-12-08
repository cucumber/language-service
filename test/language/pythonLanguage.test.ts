import assert from 'assert'

import { toStringOrRegExp } from '../../src/language/pythonLanguage.js'

describe('pythonLanguage', () => {
  it('should identify and return regexes correctly', () => {
    // NOTE these are strings that would look like from tree-sitter
    const regexes = ['"Something (.*)"', '"Catch them digits \\d+"']
    regexes.forEach(function (regex) {
      assert(toStringOrRegExp(regex) instanceof RegExp)
    })
  })
  it('should identify normal strings and just return a string', () => {
    const nonregexes = ['"test"']
    nonregexes.forEach(function (nonregex) {
      assert(toStringOrRegExp(nonregex) == 'test')
    })
  })
})
