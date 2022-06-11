import {
  ExpressionFactory,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import { DocumentUri, LocationLink, Range } from 'vscode-languageserver-types'

import { getLanguage } from './languages.js'
import { SourceAnalyzer } from './SourceAnalyzer.js'
import {
  ExpressionBuilderResult,
  ExpressionLink,
  Language,
  Link,
  ParameterTypeLink,
  ParameterTypeMeta,
  ParserAdapter,
  Source,
  TreeSitterQueryMatch,
  TreeSitterSyntaxNode,
} from './types.js'

export class ExpressionBuilder {
  constructor(private readonly parserAdapter: ParserAdapter) {}

  build(
    sources: readonly Source[],
    parameterTypes: readonly ParameterTypeMeta[]
  ): ExpressionBuilderResult {
    const expressionLinks: ExpressionLink[] = []
    const parameterTypeLinks: ParameterTypeLink[] = []
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

    for (const { source, match } of parameterTypeMatches) {
      const nameNode = syntaxNode(match, 'name')
      const expressionNode = syntaxNode(match, 'expression')
      const rootNode = syntaxNode(match, 'root')
      if (nameNode && rootNode) {
        // SpecFlow allows definition of parameter types (StepArgumentTransformation) without specifying an expression
        // See https://github.com/gasparnagy/CucumberExpressions.SpecFlow/blob/a2354d2175f5c632c9ae4a421510f314efce4111/CucumberExpressions.SpecFlow.SpecFlowPlugin/Expressions/UserDefinedCucumberExpressionParameterTypeTransformation.cs#L25-L27
        const parameterTypeExpression = expressionNode ? expressionNode.text : null
        const language = getLanguage(source.languageName)
        const parameterType = makeParameterType(
          toString(nameNode.text),
          language.convertParameterTypeExpression(parameterTypeExpression)
        )
        defineParameterType(parameterType)
        const selectionNode = expressionNode || nameNode
        const locationLink = createLocationLink(rootNode, selectionNode, source.uri)
        parameterTypeLinks.push({ parameterType, locationLink })
      }
    }

    const stepDefinitionMatches = sourceAnalyser.getSourceMatches(
      (language: Language) => language.defineStepDefinitionQueries
    )

    for (const { source, match } of stepDefinitionMatches) {
      const expressionNode = syntaxNode(match, 'expression')
      const rootNode = syntaxNode(match, 'root')
      if (expressionNode && rootNode) {
        const language = getLanguage(source.languageName)
        const stringOrRegexp = language.convertStepDefinitionExpression(expressionNode.text)
        try {
          const expression = expressionFactory.createExpression(stringOrRegexp)
          const locationLink = createLocationLink(rootNode, expressionNode, source.uri)
          expressionLinks.push({ expression, locationLink })
        } catch (err) {
          errors.push(err)
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

function toString(s: string): string {
  const match = s.match(/^['"](.*)['"]$/)
  if (!match) return s
  return match[1]
}

function syntaxNode(match: TreeSitterQueryMatch, name: string): TreeSitterSyntaxNode | undefined {
  return match.captures.find((c) => c.name === name)?.node
}

function makeParameterType(name: string, regexp: string | RegExp) {
  return new ParameterType(name, regexp, Object, (arg) => arg, true, false)
}

function sortLinks<L extends Link>(links: L[]): readonly L[] {
  return links.sort((a, b) => {
    const pathComparison = a.locationLink.targetUri.localeCompare(b.locationLink.targetUri)
    if (pathComparison !== 0) return pathComparison
    return a.locationLink.targetRange.start.line - b.locationLink.targetRange.start.line
  })
}

function createLocationLink(
  rootNode: TreeSitterSyntaxNode,
  selectionNode: TreeSitterSyntaxNode,
  targetUri: DocumentUri
) {
  const targetRange: Range = Range.create(
    rootNode.startPosition.row,
    rootNode.startPosition.column,
    rootNode.endPosition.row,
    rootNode.endPosition.column
  )
  const targetSelectionRange: Range = Range.create(
    selectionNode.startPosition.row,
    selectionNode.startPosition.column,
    selectionNode.endPosition.row,
    selectionNode.endPosition.column
  )
  const locationLink: LocationLink = {
    targetRange,
    targetSelectionRange,
    targetUri,
  }
  return locationLink
}
