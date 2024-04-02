import { functionNames } from './helpers.js'
import { Language, TreeSitterSyntaxNode } from './types.js'

export const rustLanguage: Language = {
  toParameterTypeName(node) {
    switch (node.type) {
      case 'raw_string_literal': {
        return stringLiteral(node)
      }
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
(attribute_item 
  (meta_item 
    (identifier) @meta-name
    arguments: (meta_arguments
      [
        (
          (meta_item
            (identifier) @name-key
            value: (string_literal) @name
          )
          (meta_item
            (identifier) @value-key
            value: (string_literal) @expression
          )
        )
        (
          (meta_item
            (identifier) @value-key
            value: (string_literal) @expression
          )
          (meta_item
            (identifier) @name-key
            value: (string_literal) @name
          )
        )
      ]
    )
  )
  (#eq? @meta-name "param")
  (#eq? @name-key "name")
  (#eq? @value-key "regex")
) @root
`,
  ],
  defineStepDefinitionQueries: [
    `
(source_file (attribute_item 
  (meta_item 
    (
    	(identifier) @meta-name 
      arguments: (meta_arguments
        [
          (string_literal) @expression
          (meta_item
            value: (string_literal) @expression)
          (meta_item
            (identifier)
            value: (string_literal) @expression)
          (meta_item
            value: (raw_string_literal) @expression)
        ]
      )
    )
  )  
  (#match? @meta-name "${functionNames.toLowerCase()}")
)
(function_item) ) @root
`,
  ],

  snippetParameters: {
    int: { type: 'i32', name: 'i' },
    float: { type: 'f32', name: 'f' },
    word: { type: 'String' },
    string: { type: 'String', name: 's' },
    double: { type: 'f64', name: 'd' },
    bigdecimal: { type: 'String', name: 'bigDecimal' },
    byte: { type: 'u8', name: 'b' },
    short: { type: 'i16', name: 's' },
    long: { type: 'i64', name: 'l' },
    biginteger: { type: 'String', name: 'bigInteger' },
    '': { type: 'String', name: 'arg' },
  },
  defaultSnippetTemplate: `
#[{{ #lowercase }}{{ keyword }}{{ /lowercase }}(expr = "{{ expression }}")]
fn {{ #lowercase }}{{ #underscore }}{{ expression }}{{ /underscore }}{{ /lowercase }}(world: &mut TheWorld, {{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}: {{ type }}{{ /parameters }}) {
    // {{ blurb }}
}
`,
}

export function stringLiteral(node: TreeSitterSyntaxNode | null): string {
  if (node === null) throw new Error('node cannot be null')

  let result
  if (node.text.startsWith('r#')) result = unescapeString(node.text.slice(3, -2))
  else if (node.text.startsWith('r')) result = unescapeString(node.text.slice(2, -1))
  else result = unescapeString(node.text.slice(1, -1))

  return stripLineContinuation(result)
}

export function stripLineContinuation(s: string): string {
  return s.replace(/\\\n\s*/g, '')
}

function unescapeString(s: string): string {
  return s.replace(/\\\\/g, '\\')
}
