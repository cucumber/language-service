import {
  Expression,
  ExpressionFactory,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'

import { makeParameterType, recordFromMatch, toString } from './helpers.js'
import { javaLanguage } from './javaLanguage.js'
import {
  LanguageName,
  ParameterTypeMeta,
  ParserAdpater,
  Source,
  TreeSitterLanguage,
} from './types.js'
import { typescriptLanguage } from './typescriptLanguage.js'

const treeSitterLanguageByName: Record<LanguageName, TreeSitterLanguage> = {
  java: javaLanguage,
  typescript: typescriptLanguage,
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

      const treeSitterLanguage = treeSitterLanguageByName[source.language]
      for (const defineParameterTypeQuery of treeSitterLanguage.defineParameterTypeQueries) {
        const query = this.parserAdpater.query(defineParameterTypeQuery)
        const matches = query.matches(tree.rootNode)
        const records = matches.map((match) => recordFromMatch(match, defineParameterTypeKeys))
        for (const record of records) {
          const name = record['name']
          const regexp = record['expression']
          if (name && regexp) {
            parameterTypeRegistry.defineParameterType(
              makeParameterType(toString(name), treeSitterLanguage.toStringOrRegExp(regexp))
            )
          }
        }
      }
    }

    for (const source of sources) {
      this.parserAdpater.setLanguage(source.language)
      const tree = this.parserAdpater.parser.parse(source.content)

      const treeSitterLanguage = treeSitterLanguageByName[source.language]
      for (const defineStepDefinitionQuery of treeSitterLanguage.defineStepDefinitionQueries) {
        const query = this.parserAdpater.query(defineStepDefinitionQuery)
        const matches = query.matches(tree.rootNode)
        const records = matches.map((match) =>
          recordFromMatch(match, defineStepDefinitionQueryKeys)
        )
        for (const record of records) {
          const expression = record['expression']
          if (expression) {
            expressions.push(
              expressionFactory.createExpression(treeSitterLanguage.toStringOrRegExp(expression))
            )
          }
        }
      }
    }

    return expressions
  }
}
