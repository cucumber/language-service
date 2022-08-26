import { StringOrRegExp } from '@cucumber/cucumber-expressions'
import { RegExps } from '@cucumber/cucumber-expressions/dist/cjs/src/ParameterType'

import { childrenToString, filter, NO_QUOTES, NO_SLASHES } from './helpers.js'
import { Language, TreeSitterSyntaxNode } from './types.js'

export const typescriptLanguage: Language = {
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
            key: (property_identifier) @regexp-key
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
{{ keyword }}('{{ expression }}', ({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}: {{ type }}{{ /parameters }}) => {
  // {{ blurb }}
})
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
