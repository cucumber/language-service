import {
  Expression,
  ExpressionFactory,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import Parser from 'web-tree-sitter'

import { makeParameterType, recordFromMatch, unquote } from './helpers.js'

const defineStepDefinitionQueryKeys = <const>['cucumber-expression', 'regular-expression']
const defineParameterTypeKeys = <const>['name', 'regexp']

export type TreeSitterQueries = {
  defineParameterTypeQuery: string
  defineStepDefinitionQuery: string
}

export function buildExpressions(
  parser: Parser,
  language: Parser.Language,
  treeSitterQueries: TreeSitterQueries,
  sources: string[]
): readonly Expression[] {
  const expressions: Expression[] = []
  const parameterTypeRegistry = new ParameterTypeRegistry()
  const expressionFactory = new ExpressionFactory(parameterTypeRegistry)

  for (const source of sources) {
    const tree = parser.parse(source)
    const matches = language
      .query(treeSitterQueries.defineParameterTypeQuery)
      .matches(tree.rootNode)
    const records = matches.map((match) => recordFromMatch(match, defineParameterTypeKeys))
    for (const record of records) {
      const name = record['name']
      const regexp = record['regexp']
      if (name && regexp) {
        parameterTypeRegistry.defineParameterType(makeParameterType(unquote(name), unquote(regexp)))
      }
    }
  }

  for (const source of sources) {
    const tree = parser.parse(source)
    const matches = language
      .query(treeSitterQueries.defineStepDefinitionQuery)
      .matches(tree.rootNode)
    const records = matches.map((match) => recordFromMatch(match, defineStepDefinitionQueryKeys))
    for (const record of records) {
      const cucumberExpression = record['cucumber-expression']
      if (cucumberExpression) {
        expressions.push(expressionFactory.createExpression(unquote(cucumberExpression)))
      }
      const regularExpression = record['regular-expression']
      if (regularExpression) {
        expressions.push(expressionFactory.createExpression(new RegExp(unquote(regularExpression))))
      }
    }
  }

  return expressions
}
