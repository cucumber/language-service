import { Language, TreeSitterSyntaxNode } from './types.js'

export const scalaLanguage: Language = {
  toParameterTypeName(node) {
    switch (node.type) {
      case 'string': {
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
    if (node === null) {
      return /.*/
    }
    return stringLiteral(node)
  },
  toStepDefinitionExpression(node) {
    if (node.type === 'string') {
      const text = stringLiteral(node)
      const hasRegExpAnchors = text[0] == '^' || text[text.length - 1] == '$'
      return hasRegExpAnchors ? new RegExp(text) : text
    }
    throw new Error(`Unsupported node type ${node.type}`)
  },

  defineParameterTypeQueries: [
    `
(call_expression
  function: (identifier) @function-name
  arguments: (arguments
   [
      (string)+ @name
   ]
  )
  (#match? @function-name "ParameterType")
) @root
`,
  ],
  defineStepDefinitionQueries: [
    `
(call_expression
  function: (identifier) @function-name
  arguments: (arguments
    (
      (string) @expression
    )
  )
  (#match? @function-name "Given|When|Then|And|But")
) @root
`,
  ],
  snippetParameters: {
    int: { type: 'Int', name: 'i' },
    float: { type: 'Float', name: 'f' },
    word: { type: 'String' },
    string: { type: 'String', name: 's' },
    double: { type: 'Double', name: 'd' },
    bigdecimal: { type: 'scala.math.BigDecimal', name: 'bigDecimal' },
    byte: { type: 'Byte', name: 'b' },
    short: { type: 'Short', name: 's' },
    long: { type: 'Long', name: 'l' },
    biginteger: { type: 'scala.math.BigInteger', name: 'bigInteger' },
    '': { type: 'Any', name: 'arg' },
  },
  defaultSnippetTemplate: `
{{ keyword }}("""{{ expression }}""") { ({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}: {{ type }}{{ /parameters }}) =>
  // {{ blurb }}
}
`,
}

export function stringLiteral(node: TreeSitterSyntaxNode | null): string {
  if (node === null) throw new Error('node cannot be null')
  if (node.text.startsWith('"""')) {
    const x = node.text.slice(3, -3)
    console.log(x)
    return x
  }
  return node.text.slice(1, -1)
}
