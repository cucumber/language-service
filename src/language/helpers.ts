import { ParameterType, RegExps, StringOrRegExp } from '@cucumber/cucumber-expressions'
import { DocumentUri, LocationLink, Range } from 'vscode-languageserver-types'

import { getLanguage } from './languages.js'
import { SourceMatch } from './SourceAnalyzer.js'
import {
  Link,
  NodePredicate,
  ParameterTypeLink,
  TreeSitterQueryMatch,
  TreeSitterSyntaxNode,
} from './types'

export function syntaxNode(match: TreeSitterQueryMatch, name: string): TreeSitterSyntaxNode | null {
  const nodes = syntaxNodes(match, name)
  if (nodes.length > 1)
    throw new Error(`Expected exactly one node, but got ${nodes.map((node) => node.text)}`)
  return nodes[0] || null
}

function syntaxNodes(match: TreeSitterQueryMatch, name: string): TreeSitterSyntaxNode[] {
  return match.captures.filter((c) => c.name === name).map((capture) => capture.node)
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
  const propsByName: Record<string, ParameterTypeLinkProps> = {}
  for (const { source, match } of parameterTypeMatches) {
    const nameNode = syntaxNode(match, 'name')
    const rootNode = syntaxNode(match, 'root')
    const expressionNode = syntaxNode(match, 'expression')
    if (nameNode && rootNode) {
      const language = getLanguage(source.languageName)

      const parameterTypeName = language.toParameterTypeName(nameNode)
      const regExps = language.toParameterTypeRegExps(expressionNode)
      const selectionNode = expressionNode || nameNode
      const locationLink = createLocationLink(rootNode, selectionNode, source.uri)
      const props: ParameterTypeLinkProps = (propsByName[parameterTypeName] = propsByName[
        parameterTypeName
      ] || { locationLink, regexpsList: [] })
      props.regexpsList.push(regExps)
    }
  }
  for (const [name, { regexpsList, locationLink }] of Object.entries(propsByName)) {
    const regexps: StringOrRegExp[] = regexpsList.reduce<StringOrRegExp[]>((prev, current) => {
      if (Array.isArray(current)) {
        return prev.concat(...current)
      } else {
        return prev.concat(current)
      }
    }, [])
    const parameterType = makeParameterType(name, regexps)
    parameterTypeLinks.push({ parameterType, locationLink })
  }

  return parameterTypeLinks
}

type ParameterTypeLinkProps = {
  regexpsList: RegExps[]
  locationLink: LocationLink
}

export function childrenToString(node: TreeSitterSyntaxNode, stringNodes: NodePredicate) {
  return node.children
    .filter(stringNodes)
    .map((node) => node.text)
    .join('')
}

export const NO_QUOTES: NodePredicate = (child) => child.type !== '"' && child.type !== "'"
export const NO_SLASHES: NodePredicate = (child) => child.type !== '/'

export function filter(
  node: TreeSitterSyntaxNode,
  predicate: NodePredicate
): TreeSitterSyntaxNode[] {
  return flatten(node).filter(predicate)
}

function flatten(node: TreeSitterSyntaxNode): TreeSitterSyntaxNode[] {
  return node.children.reduce((r, o) => [...r, ...flatten(o)], [node])
}
