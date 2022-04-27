import {
  Expression,
  ExpressionFactory,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import Parser from 'tree-sitter'

import { csharpLanguage } from './csharpLanguage.js'
import { javaLanguage } from './javaLanguage.js'
import { phpLanguage } from './phpLanguage.js'
import {
  LanguageName,
  ParameterTypeMeta,
  ParserAdapter,
  Source,
  TreeSitterLanguage,
} from './types.js'
import { typescriptLanguage } from './typescriptLanguage.js'

const treeSitterLanguageByName: Record<LanguageName, TreeSitterLanguage> = {
  java: javaLanguage,
  typescript: typescriptLanguage,
  c_sharp: csharpLanguage,
  php: phpLanguage,
}

const defineStepDefinitionQueryKeys = <const>['expression']
const defineParameterTypeKeys = <const>['name', 'expression']

export class ExpressionBuilder {
  constructor(private readonly parserAdapter: ParserAdapter) {}

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
      this.parserAdapter.setLanguage(source.language)
      const tree = this.parserAdapter.parser.parse(source.content)

      const treeSitterLanguage = treeSitterLanguageByName[source.language]
      for (const defineParameterTypeQuery of treeSitterLanguage.defineParameterTypeQueries) {
        const query = this.parserAdapter.query(defineParameterTypeQuery)
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
      this.parserAdapter.setLanguage(source.language)
      const tree = this.parserAdapter.parser.parse(source.content)

      const treeSitterLanguage = treeSitterLanguageByName[source.language]
      for (const defineStepDefinitionQuery of treeSitterLanguage.defineStepDefinitionQueries) {
        const query = this.parserAdapter.query(defineStepDefinitionQuery)
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

function toString(s: string): string {
  const match = s.match(/^['"](.*)['"]$/)
  if (!match) return s
  return match[1]
}

function recordFromMatch<T extends string>(
  match: Parser.QueryMatch,
  keys: readonly T[]
): Record<T, string | undefined> {
  const values = keys.map((name) => match.captures.find((c) => c.name === name)?.node?.text)
  return Object.fromEntries(keys.map((_, i) => [keys[i], values[i]])) as Record<
    T,
    string | undefined
  >
}

function makeParameterType(name: string, regexp: string | RegExp) {
  return new ParameterType(name, regexp, Object, () => undefined, false, false)
}
