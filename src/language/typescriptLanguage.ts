import { GeneratedExpression } from '@cucumber/cucumber-expressions'

import { TreeSitterLanguage } from './types.js'

export const typescriptLanguage: TreeSitterLanguage = {
  defineParameterTypeQueries: [
    `
(call_expression
  function: (identifier) @function-name
  arguments: (arguments
    (object
      [
        (
          (pair
            key: (property_identifier) @name-key
            value: (string) @name
          )
          (pair
            key: (property_identifier) @regexp-key
            value: [(regex) (string)] @expression
          )
        )
        (
          (pair
            key: (property_identifier) @regexp-key
            value: [(regex) (string)] @expression
          )
          (pair
            key: (property_identifier) @name-key
            value: (string) @name
          )
        )
      ]
    )
  )
  (#eq? @function-name "defineParameterType")
  (#eq? @name-key "name")
  (#eq? @regexp-key "regexp")
)
`,
  ],
  defineStepDefinitionQueries: [
    `
(call_expression
  function: (identifier) @function-name
  arguments: (arguments
    [
      (string) @expression
      (regex) @expression
    ]
  )
  (#match? @function-name "Given|When|Then")
)
`,
  ],

  toStringOrRegExp(s: string): string | RegExp {
    const match = s.match(/^([/'"])(.*)([/'"])$/)
    if (!match) throw new Error(`Could not match ${s}`)
    if (match[1] === '/' && match[3] === '/') return new RegExp(match[2])
    return match[2]
  },

  types: {
    int: 'number',
    float: 'number',
    word: 'string',
    string: 'string',
    double: 'number',
    bigdecimal: 'string',
    byte: 'number',
    short: 'number',
    long: 'number',
    biginteger: 'BigInt',
    '': 'unknown',
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
    biginteger: 'bigInt',
    '': 'arg',
  },
}
