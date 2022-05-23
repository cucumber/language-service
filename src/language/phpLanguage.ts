import { GeneratedExpression } from '@cucumber/cucumber-expressions'

import { TreeSitterLanguage } from './types.js'

export const phpLanguage: TreeSitterLanguage = {
  // Empty array because Behat does not support Cucumber Expressions
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `
(
  (comment)+ @expression
  (#match? @expression "Given|When|Then")
)
`,
  ],
  toStringOrRegExp(s: string): string | RegExp {
    // match multiline comment
    const match = s.match(/^(\/\*\*[\s*]*)([\s\S]*)(\n[\s]*\*\/)/)
    if (!match) throw new Error(`Could not match ${s}`)
    return new RegExp(match[2].replace(/@(Given |When |Then )/, '').trim())
  },

  types: {
    int: 'int',
    float: 'float',
    word: 'string',
    string: 'string',
    double: 'float',
    bigdecimal: 'string',
    byte: 'int',
    short: 'int',
    long: 'int',
    biginteger: 'int',
    '': 'mixed',
  },
  names: {
    int: 'i',
    float: 'f',
    word: 'word',
    string: 's',
    double: 'd',
    bigdecimal: 'bigDecimal',
    byte: 'b',
    short: 's',
    long: 'l',
    biginteger: 'BigInt',
    '': 'arg',
  },
}
