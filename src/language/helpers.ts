import { ParameterType, RegExps } from '@cucumber/cucumber-expressions'
import { DocumentUri, LocationLink, Position, Range } from 'vscode-languageserver-types'

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
  const targetSelectionRange: Range = Range.create(
    selectionNode.startPosition.row,
    selectionNode.startPosition.column,
    selectionNode.endPosition.row,
    selectionNode.endPosition.column
  )
  // The selection may precede the root node (a Rust attribute precedes its fn),
  // and LSP requires the selection range to be contained in the target range.
  const rootRange: Range = Range.create(
    rootNode.startPosition.row,
    rootNode.startPosition.column,
    rootNode.endPosition.row,
    rootNode.endPosition.column
  )
  const targetRange: Range = Range.create(
    min(rootRange.start, targetSelectionRange.start),
    max(rootRange.end, targetSelectionRange.end)
  )
  const locationLink: LocationLink = {
    targetRange,
    targetSelectionRange,
    targetUri,
  }
  return locationLink
}

function min(a: Position, b: Position): Position {
  return a.line < b.line || (a.line === b.line && a.character < b.character) ? a : b
}

function max(a: Position, b: Position): Position {
  return a.line > b.line || (a.line === b.line && a.character > b.character) ? a : b
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

export function unsupportedOperation(): never {
  throw new Error('Unsupported operation')
}
