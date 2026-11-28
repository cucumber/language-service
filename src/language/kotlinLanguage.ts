import type { Language, TreeSitterSyntaxNode } from './types.js'

export const kotlinLanguage: Language = {
  toParameterTypeName(node) {
    switch (node.type) {
      case 'string_literal':
      case 'multiline_string_literal': {
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
    if (node.type === 'string_literal' || node.type === 'multiline_string_literal') {
      const text = stringLiteral(node)
      const hasRegExpAnchors = text[0] === '^' || text[text.length - 1] === '$'
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
        (user_type (identifier) @annotation-name)
        (value_arguments
          .
          (value_argument . [(string_literal) (multiline_string_literal)] @expression)
        )
      )
    )
  )
  name: (identifier) @name
  (#eq? @annotation-name "ParameterType")
) @root
`,
    `
(function_declaration
  (modifiers
    (annotation
      (constructor_invocation
        (user_type (identifier) @annotation-name)
        (value_arguments
          [
            (
              (value_argument (identifier) @name-key [(string_literal) (multiline_string_literal)] @name)
              (value_argument (identifier) @value-key [(string_literal) (multiline_string_literal)] @expression)
            )
            (
              (value_argument (identifier) @value-key [(string_literal) (multiline_string_literal)] @expression)
              (value_argument (identifier) @name-key [(string_literal) (multiline_string_literal)] @name)
            )
          ]
        )
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
(function_declaration
  (modifiers
    (annotation
      (constructor_invocation
        (user_type (identifier) @annotation-name)
        (value_arguments
          .
          (value_argument . [(string_literal) (multiline_string_literal)] @expression)
        )
      )
    )
  )
  (#match? @annotation-name "^(Given|When|Then|And|But)$")
) @root
`,
    `
(function_declaration
  (modifiers
    (annotation
      (constructor_invocation
        (user_type (identifier) @annotation-name)
        (value_arguments
          (value_argument (identifier) @value-key [(string_literal) (multiline_string_literal)] @expression)
        )
      )
    )
  )
  (#match? @annotation-name "^(Given|When|Then|And|But)$")
  (#eq? @value-key "value")
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
    @{{ keyword }}("{{ #escapeDollars }}{{ expression }}{{ /escapeDollars }}")
    fun {{ #underscore }}{{ expression }}{{ /underscore }}({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}: {{ type }}{{ /parameters }}) {
        // {{ blurb }}
    }
`,
}

const escapes: Record<string, string> = {
  t: '\t',
  b: '\b',
  n: '\n',
  r: '\r',
  "'": "'",
  '"': '"',
  '\\': '\\',
  $: '$',
}

export function stringLiteral(node: TreeSitterSyntaxNode | null): string {
  if (node === null) {
    throw new Error('node cannot be null')
  }
  const text = node.text
  if (text.length >= 6 && text.startsWith('"""') && text.endsWith('"""')) {
    return text.slice(3, -3).replace('(?i)', '')
  }
  if (text.startsWith('"') && text.endsWith('"')) {
    // A single pass, so that an escaped backslash followed by a dollar sign is not read as one escape
    return text
      .slice(1, -1)
      .replace('(?i)', '')
      .replace(/\\(u[0-9a-fA-F]{4}|.)/g, (match, escape: string) => {
        if (escape.length === 5) {
          return String.fromCharCode(Number.parseInt(escape.slice(1), 16))
        }
        return escapes[escape] ?? match
      })
  }
  return text
}
