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
    if (node.type === 'string_literal') {
      const text = stringLiteral(node)
      const hasRegExpAnchors = text[0] == '^' || text[text.length - 1] == '$'
      return hasRegExpAnchors ? new RegExp(text) : text
    }
    return collectStringFragments(node).join('')
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
    `(method_declaration 
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
      (#match? @annotation-name "Given|When|Then|And|But")
    ) @root`,
    `(method_declaration 
      (modifiers 
        (annotation 
          name: (identifier) @annotation-name 
          arguments: (annotation_argument_list
            [
              (binary_expression) @expression
            ]
          )
        )
      )
      (#match? @annotation-name "Given|When|Then|And|But")
    ) @root`,
  ],
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

export function stringLiteral(node: TreeSitterSyntaxNode | null): string {
  if (node === null) throw new Error('node cannot be null')
  const string = node.text.slice(1, -1)
  return unescapeString(string.replace('(?i)', ''))
}

// Java escapes \ as \\. Turn \\ back to \.
function unescapeString(s: string): string {
  return s.replace(/\\\\/g, '\\')
}
function collectStringFragments(node: TreeSitterSyntaxNode): string[] {
  if (node.type === 'string_fragment') {
    return [unescapeString(node.text.replace('(?i)', ''))]
  }
  if (node.type === 'binary_expression' || node.type === 'string_literal') {
    return node.children.flatMap(collectStringFragments)
  }
  return []
}
