import { ParameterType, RegExps } from '@cucumber/cucumber-expressions'
import { dialects } from '@cucumber/gherkin'
import { DocumentUri, LocationLink, Range } from 'vscode-languageserver-types'

import { Link, NodePredicate, TreeSitterQueryMatch, TreeSitterSyntaxNode } from './types'

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

export function childrenToString(node: TreeSitterSyntaxNode, stringNodes: NodePredicate) {
  return node.children
    .filter(stringNodes)
    .map((node) => node.text)
    .join('')
}

export const NO_QUOTES: NodePredicate = (child) => child.type !== '"' && child.type !== "'"

export function filter(
  node: TreeSitterSyntaxNode,
  predicate: NodePredicate
): TreeSitterSyntaxNode[] {
  return flatten(node).filter(predicate)
}

function flatten(node: TreeSitterSyntaxNode): TreeSitterSyntaxNode[] {
  return node.children.reduce((r, o) => [...r, ...flatten(o)], [node])
}

export const functionNames = Object.values(dialects)
  .flatMap((dialect) => [...dialect.given, ...dialect.when, ...dialect.then])
  .map((keyword) => keyword.trim())
  .filter((keyword) => keyword !== '*')
  .join('|')
