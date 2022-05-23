import {
  Expression,
  GeneratedExpression,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import Parser from 'tree-sitter'
import { LocationLink } from 'vscode-languageserver-types'

import { Names, Types } from '../service/snippet/stepDefinitionSnippet.js'

export type ParameterTypeMeta = { name: string; regexp: string }

export const LanguageNames = ['java', 'typescript', 'c_sharp', 'php', 'ruby'] as const
export type LanguageName = typeof LanguageNames[number]

export type Source<L> = {
  readonly language: L
  readonly path: string
  readonly content: string
}

export type TreeSitterLanguage = {
  readonly defineParameterTypeQueries: readonly string[]
  readonly defineStepDefinitionQueries: readonly string[]
  readonly names: Names
  readonly types: Types
  toStringOrRegExp(expression: string): string | RegExp
}

export type ExpressionBuilderResult = {
  readonly expressionLinks: readonly ExpressionLink[]
  readonly errors: readonly Error[]
  readonly registry: ParameterTypeRegistry
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

export type PartialLocationLink = Pick<
  LocationLink,
  'targetUri' | 'targetRange' | 'targetSelectionRange'
>

export type ExpressionLink = {
  expression: Expression
  partialLink: PartialLocationLink
}
