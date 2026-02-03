import {
  ExpressionFactory,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'

import { createLocationLink, makeParameterType, sortLinks } from './helpers.js'
import { SourceAnalyzer } from './SourceAnalyzer.js'
import {
  ExpressionBuilderResult,
  ExpressionLink,
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

    const parameterTypeLinks: ParameterTypeLink[] = []
    sourceAnalyser.eachParameterTypeLink((parameterTypeLink) => {
      defineParameterType(parameterTypeLink.parameterType)
      parameterTypeLinks.push(parameterTypeLink)
    })

    const expressionLinks: ExpressionLink[] = []
    sourceAnalyser.eachStepDefinitionExpression(
      (stepDefinitionExpression, rootNode, expressionNode, source) => {
        try {
          const expression = expressionFactory.createExpression(stepDefinitionExpression)
          const locationLink = createLocationLink(rootNode, expressionNode, source.uri)
          expressionLinks.push({ expression, locationLink })
        } catch (err) {
          errors.push(err)
        }
      }
    )

    return {
      expressionLinks: sortLinks(expressionLinks),
      parameterTypeLinks: sortLinks(parameterTypeLinks),
      errors: sourceAnalyser.getErrors().concat(errors),
      registry,
    }
  }

  // update existing result with new sources
  rebuild(
    existingResult: ExpressionBuilderResult,
    sources: readonly Source<LanguageName>[]
  ): ExpressionBuilderResult {
    const errors: Error[] = []
    const registry = existingResult.registry
    const expressionFactory = new ExpressionFactory(registry)

    const sourceAnalyser = new SourceAnalyzer(this.parserAdapter, sources)

    // TODO: we cant currently override existing parameter type as it raises an error
    // const parameterTypeLinks: ParameterTypeLink[] = []
    // sourceAnalyser.eachParameterTypeLink((parameterTypeLink) => {
    //   defineParameterType(parameterTypeLink.parameterType)
    //   parameterTypeLinks.push(parameterTypeLink)
    // })

    // extract to private method
    sourceAnalyser.eachStepDefinitionExpression(
      (stepDefinitionExpression, rootNode, expressionNode, source) => {
        try {
          const expression = expressionFactory.createExpression(stepDefinitionExpression)
          const locationLink = createLocationLink(rootNode, expressionNode, source.uri)
          existingResult.expressionLinks.push({ expression, locationLink })
        } catch (err) {
          errors.push(err)
        }
      }
    )

    return {
      expressionLinks: sortLinks(existingResult.expressionLinks),
      parameterTypeLinks: sortLinks(existingResult.parameterTypeLinks),
      errors: sourceAnalyser.getErrors().concat(errors),
      registry,
    }
  }
}
