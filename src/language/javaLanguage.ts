import { Language } from './types.js'

export const javaLanguage: Language = {
  defineParameterTypeQueries: [
    `
(method_declaration 
  (modifiers 
    (annotation 
      name: (identifier) @annotation-name 
      arguments: (annotation_argument_list
        [
          (string_literal) @expression
        ]
      )
    )
  )
  name: (identifier) @name
  (#eq? @annotation-name "ParameterType")
) @root
    `,
    `
(method_declaration 
  (modifiers 
    (annotation 
      name: (identifier) @annotation-name 
      arguments: (annotation_argument_list
        [
          (
            (element_value_pair
              key: (identifier) @name-key
              value: (string_literal) @name
            )
            (element_value_pair
              key: (identifier) @value-key
              value: (string_literal) @expression
            )
          )
          (
            (element_value_pair
              key: (identifier) @value-key
              value: (string_literal) @expression
            )
            (element_value_pair
              key: (identifier) @name-key
              value: (string_literal) @name
            )
          )
        ]
      )
    )
  )
  (#eq? @annotation-name "ParameterType")
  (#eq? @name-key "name")
  (#eq? @value-key "value")
) @root
`,
  ],
  defineStepDefinitionQueries: [
    `
(method_declaration 
  (modifiers 
    (annotation 
      name: (identifier) @annotation-name 
      arguments: (annotation_argument_list
        [
          (string_literal) @expression
        ]
      )
    )
  )
  (#match? @annotation-name "Given|When|Then")
) @root
`,
  ],

  convertParameterTypeExpression(s: string): RegExp {
    const match = s.match(/^"(.*)"$/)
    if (!match) throw new Error(`Could not match ${s}`)
    return unescapeRegExp(match[1])
  },

  convertStepDefinitionExpression(s: string): string | RegExp {
    const match = s.match(/^"(\^.*\$)"$/)
    if (match) {
      const regExp = unescapeRegExp(match[1])
      return new RegExp(regExp)
    }
    return s.substring(1, s.length - 1)
  },

  snippetParameters: {
    int: { type: 'int', name: 'i' },
    float: { type: 'float', name: 'f' },
    word: { type: 'String' },
    string: { type: 'String', name: 's' },
    double: { type: 'double', name: 'd' },
    bigdecimal: { type: 'java.math.BigDecimal', name: 'bigDecimal' },
    byte: { type: 'byte', name: 'b' },
    short: { type: 'short', name: 's' },
    long: { type: 'long', name: 'l' },
    biginteger: { type: 'java.math.BigInteger', name: 'bigInteger' },
    '': { type: 'Object', name: 'arg' },
  },
  defaultSnippetTemplate: `
    @{{ stepKeyword }}("{{ expression }}")
    public void {{ snakeName }}({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ type }} {{ name }}{{ /parameters }}) {
        // {{ blurb }}
    }
`,
}

// Java escapes \ as \\. Turn \\ back to \.
function unescapeRegExp(regexp: string): RegExp {
  return new RegExp(regexp.replace(/\\\\/g, '\\'))
}
