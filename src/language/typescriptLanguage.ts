import { Language } from './types.js'

export const typescriptLanguage: Language = {
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
) @root
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
) @root
`,
  ],

  toStringOrRegExp(s: string): string | RegExp {
    const match = s.match(/^([/'"])(.*)([/'"])$/)
    if (!match) throw new Error(`Could not match ${s}`)
    if (match[1] === '/' && match[3] === '/') return new RegExp(match[2])
    return match[2]
  },

  snippetParameters: {
    int: { type: 'number' },
    float: { type: 'number' },
    word: { type: 'string' },
    string: { type: 'string', name: 's' },
    double: { type: 'number' },
    bigdecimal: { type: 'string', name: 'bigDecimal' },
    byte: { type: 'number' },
    short: { type: 'number' },
    long: { type: 'number' },
    biginteger: { type: 'BigInt', name: 'bigInt' },
    '': { type: 'unknown', name: 'arg' },
  },

  defaultSnippetTemplate: `

{{ stepKeyword }}('{{ expression }}', ({{ #parameters }}{{ name }}: {{ type }}{{ #seenParameter }}, {{ /seenParameter }}{{ /parameters }}) => {
  // {{ blurb }}
})
`,
}
