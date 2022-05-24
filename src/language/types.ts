import { Expression, ParameterType, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import Parser from 'tree-sitter'
import { LocationLink } from 'vscode-languageserver-types'

export type ParameterTypeName =
  | 'int'
  | 'float'
  | 'word'
  | 'string'
  | 'double'
  | 'bigdecimal'
  | 'byte'
  | 'short'
  | 'long'
  | 'biginteger'
  | ''

/**
 * Used to generate step definition snippets
 */
export type SnippetParameter = {
  /**
   * The name to use for the parameter.
   */
  name?: string
  type: string
}

export type SnippetParameters = Record<ParameterTypeName, SnippetParameter>

export type ParameterTypeMeta = { name: string; regexp: string }

export const LanguageNames = ['java', 'typescript', 'c_sharp', 'php', 'ruby'] as const
export type LanguageName = typeof LanguageNames[number]

export type Source<L> = {
  readonly languageName: L
  readonly path: string
  readonly content: string
}

export type Language = {
  readonly defaultSnippetTemplate: string
  readonly defineParameterTypeQueries: readonly string[]
  readonly defineStepDefinitionQueries: readonly string[]
  readonly snippetParameters: SnippetParameters
  toStringOrRegExp(expression: string): string | RegExp
}

export type ExpressionBuilderResult = {
  readonly expressionLinks: readonly ExpressionLink[]
  readonly parameterTypeLinks: readonly ParameterTypeLink[]
  readonly errors: readonly Error[]
  readonly registry: ParameterTypeRegistry
}

/**
 * The Node.js and Web bindings have slightly different APIs. We hide this difference behind this interface.
 * https://github.com/language/node-tree-sitter/issues/68
 */
export interface ParserAdapter {
  readonly parser: Parser
  init(): Promise<void>
  setLanguageName(languageName: LanguageName): void
  query(source: string): Parser.Query
}

export type Link = {
  locationLink: LocationLink
}

export type ExpressionLink = Link & {
  expression: Expression
}

export type ParameterTypeLink = Link & {
  parameterType: ParameterType<unknown>
}
