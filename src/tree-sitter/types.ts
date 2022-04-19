import Parser from 'tree-sitter'

export type ParameterTypeMeta = { name: string; regexp: string }

export type LanguageName = 'java' | 'typescript'

export type Source = {
  language: LanguageName
  content: string
}

export type TreeSitterQueries = {
  defineParameterTypeQueries: readonly string[]
  defineStepDefinitionQueries: readonly string[]
}

/**
 * The Node.js and Web bindings have slightly different APIs. We hide this difference behind this interface.
 * https://github.com/tree-sitter/node-tree-sitter/issues/68
 */
export interface ParserAdpater {
  readonly parser: Parser
  setLanguage(language: LanguageName): void
  query(source: string): Parser.Query
}
