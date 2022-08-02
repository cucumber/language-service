import { buildParameterTypeLinksFromMatches } from './helpers.js'
import { Language } from './types.js'

export const rubyLanguage: Language = {
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
) @root
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
) @root
`,
  ],

  convertParameterTypeExpression(expression) {
    if (expression === null) throw new Error('expression cannot be null')
    return toStringOrRegExp(expression)
  },

  convertStepDefinitionExpression(expression) {
    return toStringOrRegExp(expression)
  },
  buildParameterTypeLinks(matches) {
    return buildParameterTypeLinksFromMatches(matches)
  },

  snippetParameters: {
    int: { type: 'Integer' },
    float: { type: 'Float' },
    word: { type: 'String' },
    string: { type: 'String' },
    double: { type: 'Float' },
    bigdecimal: { type: 'BigDecimal' },
    byte: { type: 'Integer' },
    short: { type: 'Integer' },
    long: { type: 'Integer' },
    biginteger: { type: 'Integer' },
    '': { type: 'Object', name: 'arg' },
  },

  defaultSnippetTemplate: `
{{ keyword }}('{{ expression }}') do |{{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}{{ /parameters }}|
  // {{ blurb }}
end
`,
}

function toStringOrRegExp(s: string): string | RegExp {
  const match = s.match(/^([/'"])(.*)([/'"])$/)
  if (!match) throw new Error(`Could not match '${s}'`)
  if (match[1] === '/' && match[3] === '/') return new RegExp(unescapeString(match[2]))
  return unescapeString(match[2])
}

function unescapeString(s: string): string {
  return s.replace(/\\'/g, "'")
}
