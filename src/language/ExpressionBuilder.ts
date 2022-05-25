import {
  ExpressionFactory,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import Parser, { SyntaxNode } from 'tree-sitter'
import { DocumentUri, LocationLink, Range } from 'vscode-languageserver-types'

import { getLanguage } from './languages.js'
import {
  ExpressionBuilderResult,
  ExpressionLink,
  LanguageName,
  Link,
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
    const parameterTypeLinks: ParameterTypeLink[] = []
    const errors: Error[] = []
    const registry = new ParameterTypeRegistry()
    const expressionFactory = new ExpressionFactory(registry)

    const treeByContent = new Map<Source<LanguageName>, Parser.Tree>()
    const parse = (source: Source<LanguageName>): Parser.Tree => {
      let tree: Parser.Tree | undefined = treeByContent.get(source)
      if (!tree) {
        treeByContent.set(source, (tree = this.parserAdapter.parser.parse(source.content)))
      }
      return tree
    }

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

    for (const source of sources) {
      this.parserAdapter.setLanguageName(source.languageName)
      let tree: Parser.Tree
      try {
        tree = parse(source)
      } catch (err) {
        err.message += `\nuri: ${source.uri}`
        errors.push(err)
        continue
      }

      const language = getLanguage(source.languageName)
      for (const defineParameterTypeQuery of language.defineParameterTypeQueries) {
        const query = this.parserAdapter.query(defineParameterTypeQuery)
        const matches = query.matches(tree.rootNode)
        for (const match of matches) {
          const nameNode = syntaxNode(match, 'name')
          const expressionNode = syntaxNode(match, 'expression')
          const rootNode = syntaxNode(match, 'root')
          if (nameNode && expressionNode && rootNode) {
            const parameterType = makeParameterType(
              toString(nameNode.text),
              language.convertParameterTypeExpression(expressionNode.text)
            )
            defineParameterType(parameterType)
            const locationLink = createLocationLink(rootNode, expressionNode, source.uri)
            parameterTypeLinks.push({ parameterType, locationLink })
          }
        }
      }
    }

    for (const source of sources) {
      this.parserAdapter.setLanguageName(source.languageName)
      const tree = treeByContent.get(source)
      if (!tree) {
        continue
      }

      const language = getLanguage(source.languageName)
      for (const defineStepDefinitionQuery of language.defineStepDefinitionQueries) {
        const query = this.parserAdapter.query(defineStepDefinitionQuery)
        const matches = query.matches(tree.rootNode)
        for (const match of matches) {
          const expressionNode = syntaxNode(match, 'expression')
          const rootNode = syntaxNode(match, 'root')
          if (expressionNode && rootNode) {
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
      }
    }

    return {
      expressionLinks: sortLinks(expressionLinks),
      parameterTypeLinks: sortLinks(parameterTypeLinks),
      errors,
      registry,
    }
  }
}

function toString(s: string): string {
  const match = s.match(/^['"](.*)['"]$/)
  if (!match) return s
  return match[1]
}

function syntaxNode(match: Parser.QueryMatch, name: string): SyntaxNode | undefined {
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
  rootNode: SyntaxNode,
  expressionNode: SyntaxNode,
  targetUri: DocumentUri
) {
  const targetRange: Range = Range.create(
    rootNode.startPosition.row,
    rootNode.startPosition.column,
    rootNode.endPosition.row,
    rootNode.endPosition.column
  )
  const targetSelectionRange: Range = Range.create(
    expressionNode.startPosition.row,
    expressionNode.startPosition.column,
    expressionNode.endPosition.row,
    expressionNode.endPosition.column
  )
  const locationLink: LocationLink = {
    targetRange,
    targetSelectionRange,
    targetUri,
  }
  return locationLink
}
