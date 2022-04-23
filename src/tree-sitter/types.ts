import Parser from 'tree-sitter'

export type ParameterTypeMeta = { name: string; regexp: string }

export type LanguageName = 'java' | 'typescript' | 'csharp'

export type Source = {
  language: LanguageName
  content: string
}

export type TreeSitterLanguage = {
  defineParameterTypeQueries: readonly string[]
  defineStepDefinitionQueries: readonly string[]
  toStringOrRegExp(expression: string): string | RegExp
}

/**
 * The Node.js and Web bindings have slightly different APIs. We hide this difference behind this interface.
 * https://github.com/tree-sitter/node-tree-sitter/issues/68
 */
export interface ParserAdapter {
  readonly parser: Parser
  setLanguage(language: LanguageName): void
  query(source: string): Parser.Query
}
