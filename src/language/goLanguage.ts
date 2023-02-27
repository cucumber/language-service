import { Language, TreeSitterSyntaxNode } from './types.js'

export const goLanguage: Language = {
  toParameterTypeName() {
    throw new Error('Unsupported operation')
    // switch (node.type) {
    //   case 'raw_string_literal': {
    //     return stringLiteral(node)
    //   }
    //   case 'string_literal': {
    //     return stringLiteral(node)
    //   }
    //   case 'identifier': {
    //     return node.text
    //   }
    //   default: {
    //     throw new Error(`Unsupported node type ${node.type}`)
    //   }
    // }
  },
  toParameterTypeRegExps(node) {
    return stringLiteral(node)
  },
  toStepDefinitionExpression(node) {
    const text = stringLiteral(node)
    const hasRegExpAnchors = text[0] == '^' || text[text.length - 1] == '$'
    return hasRegExpAnchors ? new RegExp(text) : text
  },

  // Empty array because Go does not support Cucumber Expressions
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `
(function_declaration
  body: (block
    (call_expression
      function: (selector_expression
        field: (field_identifier) @annotation-name
      )
      arguments: (argument_list
        [
          (raw_string_literal) @expression
        ]
      )
    )
  )
  (#match? @annotation-name "Step")
) @root
`,
  ],

  snippetParameters: {
    int: { type: 'int', name: 'i' },
    float: { type: 'float', name: 'f' },
    word: { type: 'string' },
    string: { type: 'string', name: 's' },
    double: { type: 'float', name: 'd' },
    bigdecimal: { type: 'float64', name: 'bigDecimal' },
    byte: { type: 'rune', name: 'b' },
    short: { type: 'int32', name: 's' },
    long: { type: 'int64', name: 'l' },
    biginteger: { type: 'int64', name: 'bigInteger' },
    '': { type: 'string', name: 'arg' },
  },
  defaultSnippetTemplate: `
#[{{ #lowercase }}{{ keyword }}{{ /lowercase }}(expr = "{{ expression }}")]
func {{ #lowercase }}{{ expression }}{{ /lowercase }}({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }} {{ type }}{{ /parameters }}) {
    // {{ blurb }}
}
`,
}

function stringLiteral(node: TreeSitterSyntaxNode | null): string {
  if (node === null) throw new Error('node cannot be null')
  if (node.text[0] === 'r') return node.text.slice(2, -1)
  const value = node.text.slice(1, -1)
  return value
}
