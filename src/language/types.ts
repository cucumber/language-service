import {
  Expression,
  ParameterType,
  ParameterTypeRegistry,
  StringOrRegExp,
} from '@cucumber/cucumber-expressions'
import { DocumentUri, LocationLink } from 'vscode-languageserver-types'

import { SourceMatch } from './SourceAnalyzer'

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
export type SnippetParameter = Readonly<{
  /**
   * The name to use for the parameter.
   */
  name?: string
  type: string
}>

export type SnippetParameters = Readonly<Record<ParameterTypeName, SnippetParameter>>

export type ParameterTypeMeta = Readonly<{ name: string; regexp: string }>

export const LanguageNames = ['java', 'typescript', 'c_sharp', 'php', 'ruby'] as const
export type LanguageName = typeof LanguageNames[number]

export type Source<L> = Readonly<{
  readonly languageName: L
  readonly uri: DocumentUri
  readonly content: string
}>

export type Language = Readonly<{
  readonly defaultSnippetTemplate: string
  readonly defineParameterTypeQueries: readonly string[]
  readonly defineStepDefinitionQueries: readonly string[]
  readonly snippetParameters: SnippetParameters
  convertStepDefinitionExpression(expression: string): StringOrRegExp
  convertParameterTypeExpression(expression: string | null): StringOrRegExp
  buildParameterTypeLinks(matches: readonly SourceMatch[]): readonly ParameterTypeLink[]
}>

export type ExpressionBuilderResult = Readonly<{
  readonly expressionLinks: readonly ExpressionLink[]
  readonly parameterTypeLinks: readonly ParameterTypeLink[]
  readonly errors: readonly Error[]
  readonly registry: ParameterTypeRegistry
}>

export type Link = Readonly<{
  locationLink: LocationLink
}>

export type ExpressionLink = Link &
  Readonly<{
    expression: Expression
  }>

export type ParameterTypeLink = Link &
  Readonly<{
    parameterType: ParameterType<unknown>
  }>

/**
 * The Node.js and Web bindings have slightly different APIs. We hide this difference behind this interface.
 * https://github.com/tree-sitter/node-tree-sitter/issues/68
 */
export interface ParserAdapter {
  readonly parser: TreeSitterParser
  init(): Promise<void>
  setLanguageName(languageName: LanguageName): void
  query(source: string): TreeSitterQuery
}

//// We're redefining the tree-sitter API we're using so that we don't need to rely on the
//// optional tree-sitter module to be installed.

export interface TreeSitterParser {
  parse(input: string): TreeSitterTree
}

export type TreeSitterTree = Readonly<{
  rootNode: TreeSitterSyntaxNode
}>

export interface TreeSitterQuery {
  matches(node: TreeSitterSyntaxNode): readonly TreeSitterQueryMatch[]
}

export type TreeSitterSyntaxNode = Readonly<{
  text: string
  startPosition: TreeSitterPosition
  endPosition: TreeSitterPosition
}>

export type TreeSitterQueryMatch = Readonly<{
  captures: readonly TreeSitterCapture[]
}>

export type TreeSitterCapture = Readonly<{
  name: string
  node: TreeSitterSyntaxNode
}>

export type TreeSitterPosition = Readonly<{
  row: number
  column: number
}>
