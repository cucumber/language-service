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

    const parameterTypeLinks: Map<string, ParameterTypeLink[]> = new Map()
    sourceAnalyser.eachParameterTypeLink((parameterTypeLink, source) => {
      defineParameterType(parameterTypeLink.parameterType)
      parameterTypeLinks.get(source.uri)?.push(parameterTypeLink)
      if (!parameterTypeLinks.get(source.uri)) {
        parameterTypeLinks.set(source.uri, [parameterTypeLink])
      }
    })

    const expressionLinks: Map<string, ExpressionLink[]> = new Map()
    sourceAnalyser.eachStepDefinitionExpression(
      (stepDefinitionExpression, rootNode, expressionNode, source) => {
        try {
          const expression = expressionFactory.createExpression(stepDefinitionExpression)
          const locationLink = createLocationLink(rootNode, expressionNode, source.uri)
          expressionLinks.get(source.uri)?.push({ expression, locationLink })
          if (!expressionLinks.get(source.uri)) {
            expressionLinks.set(source.uri, [{ expression, locationLink }])
          }
      } catch (err) {
        errors.push(err)
      }
    })

    return {
      newExpressionLinks: new Map(), // during initial build keep empty
      expressionLinks,
      parameterTypeLinks,
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
    const newExpressionLinks: Map<string, ExpressionLink[]> = new Map()

    const sourceAnalyser = new SourceAnalyzer(this.parserAdapter, sources)

    // TODO: we cant currently override existing parameter type as it raises an error
    // We could catch the error and ignore it
    // const parameterTypeLinks: ParameterTypeLink[] = []
    // sourceAnalyser.eachParameterTypeLink((parameterTypeLink) => {
    //   defineParameterType(parameterTypeLink.parameterType)
    //   parameterTypeLinks.push(parameterTypeLink)
    // })
    
    const cleared = new Map<string, boolean>()
    sourceAnalyser.eachStepDefinitionExpression(
      (stepDefinitionExpression, rootNode, expressionNode, source) => {
        
        try {
          const expression = expressionFactory.createExpression(stepDefinitionExpression)
          const locationLink = createLocationLink(rootNode, expressionNode, source.uri)
          // clear the existing expression links for this source
          if (!cleared.get(source.uri)) {
            existingResult.expressionLinks.set(source.uri, [])
            newExpressionLinks.set(source.uri, [])
            cleared.set(source.uri, true)
          }
          existingResult.expressionLinks.get(source.uri)?.push({ expression, locationLink })
          newExpressionLinks.get(source.uri)?.push({ expression, locationLink })
        } catch (err) {
          errors.push(err)
        }
      }
    )

    return {
      newExpressionLinks,
      expressionLinks: existingResult.expressionLinks,
      parameterTypeLinks: existingResult.parameterTypeLinks,
      errors: sourceAnalyser.getErrors().concat(errors),
      registry,
    }
  }
}
