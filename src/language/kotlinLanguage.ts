import { Language, TreeSitterSyntaxNode } from './types.js'

export const kotlinLanguage: Language = {
  toParameterTypeName(node) {
    switch (node.type) {
      case 'string_literal': {
        return stringLiteral(node)
      }
      case 'simple_identifier': {
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
    throw new Error(`Unsupported node type ${node.type}`)
  },

  defineParameterTypeQueries: [
    `
(function_declaration
  (modifiers
    (annotation
      (constructor_invocation
        (user_type (type_identifier) @annotation-name)
        (value_arguments (value_argument (string_literal) @expression))
      )
    )
  )
  (simple_identifier) @name
  (#eq? @annotation-name "ParameterType")
) @root
`,
  ],
  defineStepDefinitionQueries: [
    `
(function_declaration
  (modifiers
    (annotation
      (constructor_invocation
        (user_type (type_identifier) @annotation-name)
        (value_arguments (value_argument (string_literal) @expression))
      )
    )
  )
  (#match? @annotation-name "Given|When|Then|And|But")
) @root
`,
  ],
  snippetParameters: {
    int: { type: 'Int', name: 'i' },
    float: { type: 'Float', name: 'f' },
    word: { type: 'String' },
    string: { type: 'String', name: 's' },
    double: { type: 'Double', name: 'd' },
    bigdecimal: { type: 'java.math.BigDecimal', name: 'bigDecimal' },
    byte: { type: 'Byte', name: 'b' },
    short: { type: 'Short', name: 's' },
    long: { type: 'Long', name: 'l' },
    biginteger: { type: 'java.math.BigInteger', name: 'bigInteger' },
    '': { type: 'Any', name: 'arg' },
  },
  defaultSnippetTemplate: `
    @{{ keyword }}("{{ expression }}")
    fun {{ #underscore }}{{ expression }}{{ /underscore }}({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}: {{ type }}{{ /parameters }}) {
        // {{ blurb }}
    }
`,
}

function stringLiteral(node: TreeSitterSyntaxNode | null): string {
  if (node === null) throw new Error('node cannot be null')
  const text = node.text
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1).replace(/\\\\/g, '\\')
  }
  return text
}
