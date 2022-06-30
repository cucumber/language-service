import { buildParameterTypeLinksFromMatches } from './helpers.js'
import { Language } from './types.js'

export const pythonLanguage: Language = {
  defineParameterTypeQueries: [
    `
(call
  function: (identifier) @method
  arguments: (argument_list
  (keyword_argument
       name: (identifier) @name-key
       value: (string) @name
  )
  (keyword_argument
       name: (identifier) @regexp-key
       value: (string) @expression
  )
  )
  (#eq? @method "ParameterType")
  (#eq? @name-key "name")
  (#eq? @regexp-key "regexp")
) @root
`,
  ],
  defineStepDefinitionQueries: [
    `
(decorated_definition
    (decorator
        (call
            function: (identifier) @method
            arguments: (argument_list (string) @expression)
        )
    )
    (#match? @method "(given|when|then)")
) @root
`,
  ],

  convertParameterTypeExpression(expression: string) {
    return toStringOrRegExp(expression)
  },

  convertStepDefinitionExpression(expression: string) {
    return toStringOrRegExp(expression)
  },
  buildParameterTypeLinks(matches) {
    return buildParameterTypeLinksFromMatches(matches)
  },

  snippetParameters: {
    int: { type: 'int' },
    float: { type: 'float' },
    word: { type: 'str' },
    string: { type: 'str' },
    double: { type: 'double' },
    bigdecimal: { type: 'decimal' },
    byte: { type: 'byte' },
    short: { type: 'short' },
    long: { type: 'long' },
    biginteger: { type: 'int' },
    '': { type: 'Object', name: 'arg' },
  },

  defaultSnippetTemplate: `
  @{{ #lowercase }}{{ keyword }}{{ /lowercase }}('{{ expression }}')
  def step_{{ #lowercase }}{{ keyword }}{{ /lowercase }}({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}{{ /parameters }}) :
      # {{ blurb }}`,
}

function toStringOrRegExp(s: string): string | RegExp {
  const match = s.match(/([/'"])(.*)([/'"])/)
  if (!match) throw new Error(`Could not match '${s}'`)
  if (match[2].startsWith('/') && match[2].endsWith('/')) {
    return new RegExp(match[2].slice(1, -1))
  }
  return match[2]
}
