import {
  ExpressionFactory,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'

import { createLocationLink, makeParameterType, sortLinks, syntaxNode } from './helpers.js'
import { getLanguage } from './languages.js'
import { SourceAnalyzer } from './SourceAnalyzer.js'
import {
  ExpressionBuilderResult,
  ExpressionLink,
  Language,
  LanguageName,
  ParameterTypeLink,
  ParameterTypeMeta,
  ParserAdapter,
  Source,
} from './types.js'

export class ExpressionBuilder {
  constructor(private readonly parserAdapter: ParserAdapter) {}

  build(
    sources: readonly Source<LanguageName>[],
    parameterTypes: readonly ParameterTypeMeta[]
  ): ExpressionBuilderResult {
    const expressionLinks: ExpressionLink[] = []
    const errors: Error[] = []
    const registry = new ParameterTypeRegistry()
    const expressionFactory = new ExpressionFactory(registry)

    function defineParameterType(parameterType: ParameterType<unknown>) {
      try {
        registry.defineParameterType(parameterType)
      } catch (err) {
        errors.push(err)
      }
    }

    for (const parameterType of parameterTypes) {
      defineParameterType(makeParameterType(parameterType.name, new RegExp(parameterType.regexp)))
    }

    const sourceAnalyser = new SourceAnalyzer(this.parserAdapter, sources)

    const parameterTypeMatches = sourceAnalyser.getSourceMatches(
      (language: Language) => language.defineParameterTypeQueries
    )

    let parameterTypeLinks: ParameterTypeLink[] = []
    for (const [language, matches] of parameterTypeMatches.entries()) {
      const links = language.buildParameterTypeLinks(matches)
      parameterTypeLinks = parameterTypeLinks.concat(links)
      for (const { parameterType } of links) {
        defineParameterType(parameterType)
      }
    }

    const stepDefinitionMatches = sourceAnalyser.getSourceMatches(
      (language: Language) => language.defineStepDefinitionQueries
    )

    for (const [, sourceMatches] of stepDefinitionMatches.entries()) {
      for (const { source, match } of sourceMatches) {
        const expressionNode = syntaxNode(match, 'expression')
        const rootNode = syntaxNode(match, 'root')
        if (expressionNode && rootNode) {
          const language = getLanguage(source.languageName)
          const stepDefinitionExpression = language.toStepDefinitionExpression(expressionNode)
          try {
            const expression = expressionFactory.createExpression(stepDefinitionExpression)
            const locationLink = createLocationLink(rootNode, expressionNode, source.uri)
            expressionLinks.push({ expression, locationLink })
          } catch (err) {
            errors.push(err)
          }
        }
      }
    }

    return {
      expressionLinks: sortLinks(expressionLinks),
      parameterTypeLinks: sortLinks(parameterTypeLinks),
      errors: sourceAnalyser.getErrors().concat(errors),
      registry,
    }
  }
}
