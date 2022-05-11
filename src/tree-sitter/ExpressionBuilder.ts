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
import { rubyLanguage } from './rubyLanguage.js'
import {
  ExpressionBuilderResult,
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
  ruby: rubyLanguage,
}

const defineStepDefinitionQueryKeys = <const>['expression']
const defineParameterTypeKeys = <const>['name', 'expression']

export class ExpressionBuilder {
  constructor(private readonly parserAdapter: ParserAdapter) {}

  build(
    sources: readonly Source<LanguageName>[],
    parameterTypes: readonly ParameterTypeMeta[]
  ): ExpressionBuilderResult {
    const expressions: Expression[] = []
    const errors: Error[] = []
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const expressionFactory = new ExpressionFactory(parameterTypeRegistry)

    const treeByContent = new Map<Source<LanguageName>, Parser.Tree>()
    const parse = (source: Source<LanguageName>): Parser.Tree => {
      let tree: Parser.Tree | undefined = treeByContent.get(source)
      if (!tree) {
        treeByContent.set(source, (tree = this.parserAdapter.parser.parse(source.content)))
      }
      return tree
    }

    for (const parameterType of parameterTypes) {
      parameterTypeRegistry.defineParameterType(
        makeParameterType(parameterType.name, new RegExp(parameterType.regexp))
      )
    }

    for (const source of sources) {
      this.parserAdapter.setLanguage(source.language)
      let tree: Parser.Tree
      try {
        tree = parse(source)
      } catch (err) {
        err.message += `\npath: ${source.path}`
        errors.push(err)
        continue
      }

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
      const tree = treeByContent.get(source)
      if (!tree) {
        continue
      }

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
            const stringOrRegexp = treeSitterLanguage.toStringOrRegExp(expression)
            expressions.push(expressionFactory.createExpression(stringOrRegexp))
          }
        }
      }
    }

    return {
      expressions,
      errors,
    }
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
