import { StringOrRegExp } from '@cucumber/cucumber-expressions'

import { unsupportedOperation } from './helpers.js'
import { Language, TreeSitterSyntaxNode } from './types.js'

export const clojureLanguage: Language = {
  toParameterTypeName: unsupportedOperation,
  toParameterTypeRegExps: unsupportedOperation,
  toStepDefinitionExpression(node: TreeSitterSyntaxNode): StringOrRegExp {
    const text = stringLiteral(node)

    return isRegExp(text) ? new RegExp(text) : text
  },

  // Empty array as Clojure supports dynamic typing in clojure expresssions.
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `(list_lit
	      value: (sym_lit
    	    name: (sym_name) @operator-name)
        value: (str_lit) @expression
        value: (vec_lit)
        value: (list_lit)
      (#match? @operator-name "Given|When|Then|And|But"))
      @root`,
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
    // This step definition uses Cucumber Expressions. See https://github.com/gasparnagy/CucumberExpressions.SpecFlow
    ({{ keyword }} "{{ expression }}" [state])
`,
}

export function stringLiteral(node: TreeSitterSyntaxNode | null): string {
  if (node === null) throw new Error('node cannot be null')
  return node.text.slice(1, -1)
}
export function isRegExp(cleanWord: string): boolean {
  const namedGroupMatch = /\?P/
  const specialCharsMatch = /\(|\)|\.|\*|\\|\|/
  const containsNamedGroups = namedGroupMatch.test(cleanWord)
  const containsSpecialChars = specialCharsMatch.test(cleanWord)
  const hasRegExpAnchors = cleanWord[0] == '^' || cleanWord[cleanWord.length - 1] == '$'
  return hasRegExpAnchors || containsNamedGroups || containsSpecialChars
}
