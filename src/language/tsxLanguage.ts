import { StringOrRegExp } from '@cucumber/cucumber-expressions'
import { RegExps } from '@cucumber/cucumber-expressions/dist/cjs/src/ParameterType'

import { childrenToString, filter, NO_QUOTES } from './helpers.js'
import { NO_EXPRESSION } from './SourceAnalyzer.js'
import { Language, TreeSitterSyntaxNode } from './types.js'

export const tsxLanguage: Language = {
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
      (template_string) @expression
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

export function toStringOrRegExp(node: TreeSitterSyntaxNode): StringOrRegExp {
  switch (node.type) {
    case 'regex': {
      let flags = ''
      let flag: string
      const s = node.text
      for (let i = s.length - 1; (flag = s[i]) !== '/'; i--) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags
        flags = `${flags}${flag}`
      }
      const source = node.children
        .filter((child) => child.type === 'regex_pattern')
        .map((node) => node.text)
        .join('')
      return new RegExp(unescapeString(source), flags)
    }
    case 'string':
      return unescapeString(childrenToString(node, NO_QUOTES))
    case 'template_string': {
      const substitutions = node.children.filter((node) => node.type === 'template_substitution')
      if (substitutions.length > 0) {
        // Can't handle template strings with substitutions.
        return NO_EXPRESSION
      }
      return node.text.slice(1, node.text.length - 1)
    }
    default:
      throw new Error(`Unexpected type: ${node.type}`)
  }
}

function unescapeString(s: string): string {
  return s.replace(/\\'/g, "'").replace(/\\"/g, '"')
}
