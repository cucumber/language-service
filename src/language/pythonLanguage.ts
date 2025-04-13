import { RegExps, StringOrRegExp } from '@cucumber/cucumber-expressions'

import { Language, TreeSitterSyntaxNode } from './types.js'

export const pythonLanguage: Language = {
  toParameterTypeName(node: TreeSitterSyntaxNode): string {
    switch (node.type) {
      case 'string': {
        return stringLiteral(node.text)
      }
      case 'concatenated_string': {
        return concatStringLiteral(node.text)
      }
      case 'identifier': {
        return node.text
      }
      default: {
        throw new Error(`Unsupported node type ${node.type}`)
      }
    }
  },
  toParameterTypeRegExps(node: TreeSitterSyntaxNode): RegExps {
    switch (node.type) {
      case 'string':
      case 'identifier': {
        return RegExp(cleanRegExp(stringLiteral(node.text)))
      }
      case 'concatenated_string': {
        return RegExp(cleanRegExp(concatStringLiteral(node.text)))
      }
      default: {
        throw new Error(`Unsupported node type ${node.type}`)
      }
    }
  },
  toStepDefinitionExpression(node: TreeSitterSyntaxNode): StringOrRegExp {
    // TODO: Handle binary operators (`+`) with strings
    return toStringOrRegExp(node.text)
  },
  defineParameterTypeQueries: [
    `(call
      arguments: (argument_list
        (keyword_argument
          name: (identifier) @name-key
          value: (string) @name
          (#eq? @name-key "name")
        )
        (keyword_argument
          name: (identifier) @regexp-key
          value: (string) @expression
          (#eq? @regexp-key "regexp")
        )
    )) @root`,
    `(call
      arguments: (argument_list
        (keyword_argument
          name: (identifier) @name-key
          value: (string) @name
          (#eq? @name-key "name")
        )
        (keyword_argument
          name: (identifier) @regexp-key
          value: (concatenated_string) @expression
          (#eq? @regexp-key "regexp")
        )
    )) @root`,
    `(call
      arguments: (argument_list
          (keyword_argument
          name: (identifier) @regexp-key
          value: (string) @expression
          (#eq? @regexp-key "regexp")
        )
        (keyword_argument
          name: (identifier) @name-key
          value: (string) @name
          (#eq? @name-key "name")
        )
    )) @root`,
    `(call
      arguments: (argument_list
        (keyword_argument
          name: (identifier) @regexp-key
          value: (concatenated_string) @expression
          (#eq? @regexp-key "regexp")
        )
        (keyword_argument
          name: (identifier) @name-key
          value: (string) @name
          (#eq? @name-key "name")
        )
    )) @root`,
  ],
  defineStepDefinitionQueries: [
    `(decorated_definition
      (decorator
        (call
          function: (identifier) @method
          arguments: (argument_list (string) @expression)
        )
      )
      (#match? @method "(given|when|then|step|Given|When|Then|Step)")
    ) @root`,
    // pytest-bdd
    `(decorator
      (call
        function: (identifier) @annotation-name
        arguments: (argument_list
          (call
            function: (attribute) @parser
            arguments: (argument_list
              [
                (string) @expression
              ]
            )
          )
        )
      )
      (#match? @annotation-name "given|when|then|step")
      (#match? @parser "parser")
    ) @root`,
    `(decorator
      (call
        function: (identifier) @annotation-name
        arguments: (argument_list
          (call
            function: (attribute) @parser
            arguments: (argument_list
              [
                (binary_operator) @expression
              ]
            )
          )
        )
      )
      (#match? @annotation-name "given|when|then|step")
      (#match? @parser "parser")
    ) @root`,
  ],
  snippetParameters: {
    int: { type: 'int' },
    float: { type: 'float' },
    word: { type: 'str' },
    string: { type: 'str' },
    double: { type: 'double' },
    bigdecimal: { type: 'decimal' },
    byte: { type: 'byte' },
    short: { type: 'short' },
    long: { type: 'long' },
    biginteger: { type: 'int' },
    '': { type: 'Object', name: 'arg' },
  },
  defaultSnippetTemplate: `
@{{ #lowercase }}{{ keyword }}{{ /lowercase }}('{{ expression }}')
def step_{{ #lowercase }}{{ keyword }}{{ /lowercase }}(context{{ #parameters }}, {{ name }}{{ /parameters }}):
    # This was autogenerated using Cucumber Expressions syntax.
    # Please convert to use Regular Expressions, as Behave does not currently support Cucumber Expressions.`,
}

function cleanRegExp(regExpString: string): string {
  return regExpString.startsWith('/') ? regExpString.slice(1, -1) : regExpString
}

export function toStringOrRegExp(step: string): StringOrRegExp {
  const stepText = removePrefix(step, 'u')
  const strippedStepText = stepText.slice(1, -1)
  return isRegExp(strippedStepText)
    ? RegExp(cleanRegExp(strippedStepText.split('?P').join('')))
    : strippedStepText
}

export function concatStringLiteral(text: string): string {
  return removePrefix(text, 'f')
    .split('\\\n')
    .map((x) => x.replace(/"/g, ''))
    .map((x) => x.trim())
    .join('')
}

export function stringLiteral(text: string): string {
  return removePrefix(text, 'f').slice(1, -1)
}

export function isRegExp(cleanWord: string): boolean {
  const startsWithSlash = cleanWord.startsWith('/')
  const namedGroupMatch = /\?P/
  const specialCharsMatch = /\(|\)|\.|\*|\\|\|/
  const containsNamedGroups = namedGroupMatch.test(cleanWord)
  const containsSpecialChars = specialCharsMatch.test(cleanWord)
  return startsWithSlash || containsNamedGroups || containsSpecialChars
}

function removePrefix(text: string, prefix: string): string {
  return text.startsWith(prefix) ? text.slice(1) : text
}
