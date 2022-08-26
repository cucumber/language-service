import { buildParameterTypeLinksFromMatches } from './helpers.js'
import { Language, TreeSitterSyntaxNode } from './types.js'

export const javaLanguage: Language = {
  toParameterTypeName(node) {
    switch (node.type) {
      case 'string_literal': {
        return stringLiteral(node)
      }
      case 'identifier': {
        return node.text
      }
      default: {
        throw new Error(`Unsupported node type ${node.type}`)
      }
    }
  },
  toParameterTypeRegExps(node) {
    return stringLiteral(node)
  },
  toStepDefinitionExpression(node) {
    const text = stringLiteral(node)
    const hasRegExpAnchors = text[0] == '^' || text[text.length - 1] == '$'
    return hasRegExpAnchors ? new RegExp(text) : text
  },

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

  buildParameterTypeLinks(matches) {
    return buildParameterTypeLinksFromMatches(matches)
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
    @{{ keyword }}("{{ expression }}")
    public void {{ #underscore }}{{ expression }}{{ /underscore }}({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ type }} {{ name }}{{ /parameters }}) {
        // {{ blurb }}
    }
`,
}

function stringLiteral(node: TreeSitterSyntaxNode | null): string {
  if (node === null) throw new Error('node cannot be null')
  return unescapeString(node.text.slice(1, -1))
}

// Java escapes \ as \\. Turn \\ back to \.
function unescapeString(s: string): string {
  return s.replace(/\\\\/g, '\\')
}
