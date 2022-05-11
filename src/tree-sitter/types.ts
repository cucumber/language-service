import { Expression } from '@cucumber/cucumber-expressions'
import Parser from 'tree-sitter'

export type ParameterTypeMeta = { name: string; regexp: string }

export const LanguageNames = ['java', 'typescript', 'c_sharp', 'php', 'ruby'] as const
export type LanguageName = typeof LanguageNames[number]

export type Source<L> = {
  readonly language: L
  readonly path: string
  readonly content: string
}

export type TreeSitterLanguage = {
  defineParameterTypeQueries: readonly string[]
  defineStepDefinitionQueries: readonly string[]
  toStringOrRegExp(expression: string): string | RegExp
}

export type ExpressionBuilderResult = {
  readonly expressions: readonly Expression[]
  readonly errors: readonly Error[]
}

/**
 * The Node.js and Web bindings have slightly different APIs. We hide this difference behind this interface.
 * https://github.com/tree-sitter/node-tree-sitter/issues/68
 */
export interface ParserAdapter {
  readonly parser: Parser
  init(): Promise<void>
  setLanguage(language: LanguageName): void
  query(source: string): Parser.Query
}
