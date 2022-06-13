import { ParameterType, RegExps } from '@cucumber/cucumber-expressions'
import { DocumentUri, LocationLink, Range } from 'vscode-languageserver-types'

import { getLanguage } from './languages.js'
import { SourceMatch } from './SourceAnalyzer.js'
import { Link, ParameterTypeLink, TreeSitterQueryMatch, TreeSitterSyntaxNode } from './types'

export function stripQuotes(s: string): string {
  const match = s.match(/^['"](.*)['"]$/)
  if (!match) return s
  return match[1]
}

export function syntaxNode(
  match: TreeSitterQueryMatch,
  name: string
): TreeSitterSyntaxNode | undefined {
  return match.captures.find((c) => c.name === name)?.node
}

export function makeParameterType(name: string, regexps: RegExps) {
  return new ParameterType(name, regexps, Object, (arg) => arg, true, false)
}

export function sortLinks<L extends Link>(links: L[]): readonly L[] {
  return links.sort((a, b) => {
    const pathComparison = a.locationLink.targetUri.localeCompare(b.locationLink.targetUri)
    if (pathComparison !== 0) return pathComparison
    return a.locationLink.targetRange.start.line - b.locationLink.targetRange.start.line
  })
}

export function createLocationLink(
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

export function buildParameterTypeLinksFromMatches(
  parameterTypeMatches: readonly SourceMatch[]
): readonly ParameterTypeLink[] {
  const parameterTypeLinks: ParameterTypeLink[] = []
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
        stripQuotes(nameNode.text),
        language.convertParameterTypeExpression(parameterTypeExpression)
      )
      const selectionNode = expressionNode || nameNode
      const locationLink = createLocationLink(rootNode, selectionNode, source.uri)
      parameterTypeLinks.push({ parameterType, locationLink })
    }
  }
  return parameterTypeLinks
}
