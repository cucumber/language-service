import {
  Expression,
  ExpressionFactory,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'

import { makeParameterType, recordFromMatch, toString, toStringOrRegExp } from './helpers.js'
import { javaQueries } from './javaQueries.js'
import {
  LanguageName,
  ParameterTypeMeta,
  ParserAdpater,
  Source,
  TreeSitterQueries,
} from './types.js'
import { typeScriptQueries } from './typeScriptQueries.js'

const treeSitterQueriesByLanguageName: Record<LanguageName, TreeSitterQueries> = {
  java: javaQueries,
  typescript: typeScriptQueries,
}

const defineStepDefinitionQueryKeys = <const>['expression']
const defineParameterTypeKeys = <const>['name', 'expression']

export class ExpressionBuilder {
  constructor(private readonly parserAdpater: ParserAdpater) {}

  build(
    sources: readonly Source[],
    parameterTypes: readonly ParameterTypeMeta[]
  ): readonly Expression[] {
    const expressions: Expression[] = []
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const expressionFactory = new ExpressionFactory(parameterTypeRegistry)

    for (const parameterType of parameterTypes) {
      parameterTypeRegistry.defineParameterType(
        makeParameterType(parameterType.name, new RegExp(parameterType.regexp))
      )
    }

    for (const source of sources) {
      this.parserAdpater.setLanguage(source.language)
      const tree = this.parserAdpater.parser.parse(source.content)

      const treeSitterQueries = treeSitterQueriesByLanguageName[source.language]
      for (const defineParameterTypeQuery of treeSitterQueries.defineParameterTypeQueries) {
        const query = this.parserAdpater.query(defineParameterTypeQuery)
        const matches = query.matches(tree.rootNode)
        const records = matches.map((match) => recordFromMatch(match, defineParameterTypeKeys))
        for (const record of records) {
          const name = record['name']
          const regexp = record['expression']
          if (name && regexp) {
            parameterTypeRegistry.defineParameterType(
              makeParameterType(toString(name), toStringOrRegExp(regexp))
            )
          }
        }
      }
    }

    for (const source of sources) {
      this.parserAdpater.setLanguage(source.language)
      const tree = this.parserAdpater.parser.parse(source.content)

      const treeSitterQueries = treeSitterQueriesByLanguageName[source.language]
      for (const defineStepDefinitionQuery of treeSitterQueries.defineStepDefinitionQueries) {
        const query = this.parserAdpater.query(defineStepDefinitionQuery)
        const matches = query.matches(tree.rootNode)
        const records = matches.map((match) =>
          recordFromMatch(match, defineStepDefinitionQueryKeys)
        )
        for (const record of records) {
          const expression = record['expression']
          if (expression) {
            expressions.push(expressionFactory.createExpression(toStringOrRegExp(expression)))
          }
        }
      }
    }

    return expressions
  }
}
