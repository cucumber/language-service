import {
  Expression,
  ExpressionFactory,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import Parser from 'web-tree-sitter'

import { makeParameterType, recordFromMatch, unquote } from './helpers.js'

export function buildExpressionsFromTypeScript(
  parser: Parser,
  language: Parser.Language,
  sources: string[]
): readonly Expression[] {
  const expressions: Expression[] = []
  const parameterTypeRegistry = new ParameterTypeRegistry()
  const expressionFactory = new ExpressionFactory(parameterTypeRegistry)

  for (const source of sources) {
    const tree = parser.parse(source)
    const matches = language.query(defineParameterTypeQuery).matches(tree.rootNode)
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
    const matches = language.query(defineStepDefinitionQuery).matches(tree.rootNode)
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

const defineStepDefinitionQuery = `
(call_expression
  function: (identifier) @function-name
  arguments: (arguments
    [
      (string) @cucumber-expression
      (regex) @regular-expression
    ]
  )
  (#match? @function-name "Given|When|Then")
)
`

const defineStepDefinitionQueryKeys = <const>['cucumber-expression', 'regular-expression']

const defineParameterTypeQuery = `
(call_expression
  function: (identifier) @function-name
  arguments: (arguments
    (object
      [
        (
          (pair
            key: (property_identifier) @string-key
            value: (string) @name
          )
          (pair
            key: (property_identifier) @regex-key
            value: (regex) @regexp
          )
        )
        (
          (pair
            key: (property_identifier) @regex-key
            value: (regex) @regexp
          )
          (pair
            key: (property_identifier) @string-key
            value: (string) @name
          )
        )
      ]
    )
  )
  (#eq? @function-name "defineParameterType")
  (#eq? @string-key "name")
  (#eq? @regex-key "regexp")
)
`

const defineParameterTypeKeys = <const>['name', 'regexp']
