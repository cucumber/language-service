import { StringOrRegExp } from '@cucumber/cucumber-expressions'

import { unsupportedOperation } from './helpers.js'
import { Language, TreeSitterSyntaxNode } from './types.js'

export const goLanguage: Language = {
  toParameterTypeName: unsupportedOperation,
  toParameterTypeRegExps: unsupportedOperation,
  toStepDefinitionExpression(node: TreeSitterSyntaxNode): StringOrRegExp {
    const text = stringLiteral(node)
    const hasRegExpAnchors = text[0] == '^' || text[text.length - 1] == '$'
    return hasRegExpAnchors ? new RegExp(text) : text
  },
  // Empty array as Godog does not support Cucumber Expressions
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `(function_declaration
      body: (block
        (expression_statement
          (call_expression
            function: (selector_expression
              field: (field_identifier) @annotation-name
            )
            arguments: (argument_list
              [
                (raw_string_literal) @expression
              ]
            )
            (#match? @annotation-name "Given|When|Then|Step")))))@root
    `,
    `(function_declaration
      body: (block
        (expression_statement
          (call_expression
            function: (selector_expression
              field: (field_identifier) @annotation-name
            )
            arguments: (argument_list
              [
                (interpreted_string_literal) @expression
              ]
            )
            (#match? @annotation-name "Given|When|Then|Step")))))@root
    `,
    `(method_declaration
      body: (block
        (expression_statement
          (call_expression
            function: (selector_expression
              field: (field_identifier) @annotation-name
            )
            arguments: (argument_list
              [
                (raw_string_literal) @expression
              ]
            )
            (#match? @annotation-name "Given|When|Then|Step")))))@root
    `,
    `(method_declaration
      body: (block
        (expression_statement
          (call_expression
            function: (selector_expression
              field: (field_identifier) @annotation-name
            )
            arguments: (argument_list
              [
                (interpreted_string_literal) @expression
              ]
            )
            (#match? @annotation-name "Given|When|Then|Step")))))@root
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
  // Generated with Cucumber Expressions syntax, which are not supported by Godog. Convert to Regular Expressions.
  ctx.{{ keyword }}(\`{{ expression }}\`, <stepFunc>)
`,
}

export function stringLiteral(node: TreeSitterSyntaxNode | null): string {
  if (node === null) throw new Error('node cannot be null')
  return node.text.slice(1, -1)
}
