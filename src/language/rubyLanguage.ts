import { StringOrRegExp } from '@cucumber/cucumber-expressions'
import { RegExps } from '@cucumber/cucumber-expressions/dist/cjs/src/ParameterType'

import { childrenToString, filter, NO_QUOTES, NO_SLASHES } from './helpers.js'
import { Language, TreeSitterSyntaxNode } from './types.js'

export const rubyLanguage: Language = {
  toParameterTypeName(node) {
    return childrenToString(node, NO_QUOTES)
  },
  toParameterTypeRegExps(node) {
    return toRegExps(node)
  },
  toStepDefinitionExpression(node) {
    return toStringOrRegExp(node)
  },
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
          value: [
            (regex) 
            (string) 
            (array
              [
                (regex) 
                (string) 
              ]
            )
          ] @expression
        )
      )
      (
        (pair
          key: (hash_key_symbol) @regexp-key
          value: (regex) @expression
        )
        (pair
          key: (hash_key_symbol) @name-key
          value: [
            (regex) 
            (string) 
            (array
              [
                (regex) 
                (string) 
              ]
            )
          ] @expression
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

function toRegExps(node: TreeSitterSyntaxNode | null): RegExps {
  if (node === null) throw new Error('node cannot be null')
  switch (node.type) {
    case 'regex':
    case 'string':
      return toStringOrRegExp(node)
    case 'array':
      return filter(node, (child) => child.type === 'regex').map(toStringOrRegExp)
    default:
      throw new Error(`Unexpected type: ${node.type}`)
  }
}

function toStringOrRegExp(node: TreeSitterSyntaxNode): StringOrRegExp {
  switch (node.type) {
    case 'regex':
      return new RegExp(childrenToString(node, NO_SLASHES))
    case 'string':
      return childrenToString(node, NO_QUOTES)
    default:
      throw new Error(`Unexpected type: ${node.type}`)
  }
}
