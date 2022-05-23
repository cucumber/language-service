import { GeneratedExpression } from '@cucumber/cucumber-expressions'

import { TreeSitterLanguage } from './types.js'

export const rubyLanguage: TreeSitterLanguage = {
  defineParameterTypeQueries: [
    `
(call
  method: (constant) @method
  arguments: (argument_list
    [
      (
        (pair
          key: (hash_key_symbol) @name-key
          value: (string) @name
        )
        (pair
          key: (hash_key_symbol) @regexp-key
          value: (regex) @expression
        )
      )
      (
        (pair
          key: (hash_key_symbol) @regexp-key
          value: (regex) @expression
        )
        (pair
          key: (hash_key_symbol) @name-key
          value: (string) @name
        )
      )
    ]
  )
  (#eq? @method "ParameterType")
  (#eq? @name-key "name")
  (#eq? @regexp-key "regexp")
)
`,
  ],
  defineStepDefinitionQueries: [
    `
(call
  method: (constant) @method
  arguments: (argument_list
    [
      (string) @expression
      (regex) @expression
    ]
  )
  (#match? @method "(Given|When|Then)$")
)
`,
  ],

  toStringOrRegExp(s: string): string | RegExp {
    const match = s.match(/^([/'"])(.*)([/'"])$/)
    if (!match) throw new Error(`Could not match '${s}'`)
    if (match[1] === '/' && match[3] === '/') return new RegExp(match[2])
    return match[2]
  },

  types: {
    int: 'Integer',
    float: 'Float',
    word: 'String',
    string: 'String',
    double: 'Float',
    bigdecimal: 'BigDecimal',
    byte: 'Integer',
    short: 'Integer',
    long: 'Integer',
    biginteger: 'Integer',
    '': 'Object',
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
