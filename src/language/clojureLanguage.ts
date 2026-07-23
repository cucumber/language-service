import { StringOrRegExp } from '@cucumber/cucumber-expressions'

import { unsupportedOperation } from './helpers.js'
import { Language, TreeSitterSyntaxNode } from './types.js'

export const clojureLanguage: Language = {
  toParameterTypeName: unsupportedOperation,
  toParameterTypeRegExps: unsupportedOperation,
  toStepDefinitionExpression(node: TreeSitterSyntaxNode): StringOrRegExp {
    switch (node.type) {
      case 'regex_lit': {
        const text = regexLiteral(node)
        return new RegExp(text)
      }
      case 'str_lit': {
        const text = stringLiteral(node)
        // If the string contains regex anchors or capture groups, treat as regex
        const hasRegExpAnchors = text[0] == '^' || text[text.length - 1] == '$'
        const hasCaptures = /\(.*\)/.test(text)
        if (hasRegExpAnchors || hasCaptures) {
          return new RegExp(text)
        }
        return text
      }
      default:
        throw new Error(`Unsupported node type: ${node.type}`)
    }
  },
  // Clojure cucumber does not support ParameterType definitions
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `
(list_lit
  value: (sym_lit
    name: (sym_name) @annotation-name)
  value: [
    (str_lit) @expression
    (regex_lit) @expression
  ]
  (#match? @annotation-name "^(Given|When|Then|And|But)$")
) @root
`,
  ],
  snippetParameters: {
    int: { type: 'int', name: 'i' },
    float: { type: 'float', name: 'f' },
    word: { type: 'String' },
    string: { type: 'String', name: 's' },
    double: { type: 'double', name: 'd' },
    bigdecimal: { type: 'BigDecimal', name: 'bigDecimal' },
    byte: { type: 'byte', name: 'b' },
    short: { type: 'short', name: 's' },
    long: { type: 'long', name: 'l' },
    biginteger: { type: 'BigInteger', name: 'bigInteger' },
    '': { type: 'Object', name: 'arg' },
  },
  defaultSnippetTemplate: `
({{ keyword }} "{{ expression }}" [{{ #parameters }}{{ #seenParameter }} {{ /seenParameter }}{{ name }}{{ /parameters }}]
  ;; {{ blurb }}
  )
`,
}

export function stringLiteral(node: TreeSitterSyntaxNode): string {
  // str_lit text is like "expression" — strip the surrounding quotes
  const text = node.text
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1)
  }
  return text
}

export function regexLiteral(node: TreeSitterSyntaxNode): string {
  // regex_lit text is like #"^pattern$" — strip the #" prefix and " suffix
  const text = node.text
  if (text.startsWith('#"') && text.endsWith('"')) {
    return text.slice(2, -1)
  }
  return text
}
