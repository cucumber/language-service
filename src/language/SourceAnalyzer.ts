import { RegExps, StringOrRegExp } from '@cucumber/cucumber-expressions'
import { LocationLink } from 'vscode-languageserver-types'

import { createLocationLink, makeParameterType, syntaxNode } from './helpers.js'
import { getLanguage } from './languages.js'
import {
  Language,
  LanguageName,
  ParameterTypeLink,
  ParserAdapter,
  Source,
  TreeSitterQueryMatch,
  TreeSitterSyntaxNode,
  TreeSitterTree,
} from './types.js'

export type GetQueryStrings = (language: Language) => readonly string[]
export type SourceMatch = {
  source: Source<LanguageName>
  match: TreeSitterQueryMatch
}

export const NO_EXPRESSION = ''

export class SourceAnalyzer {
  private readonly errors: Error[] = []
  private readonly treeByContent = new Map<Source<LanguageName>, TreeSitterTree>()

  constructor(
    private readonly parserAdapter: ParserAdapter,
    private readonly sources: readonly Source<LanguageName>[]
  ) {}

  eachParameterTypeLink(
    callback: (parameterTypeLink: ParameterTypeLink, source: Source<LanguageName>) => void
  ) {
    const parameterTypeMatches = this.getSourceMatches(
      (language: Language) => language.defineParameterTypeQueries
    )
    for (const [, sourceMatches] of parameterTypeMatches.entries()) {
      const propsByName: Record<string, ParameterTypeLinkProps> = {}
      for (const { source, match } of sourceMatches) {
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
          ] || { locationLink, regexpsList: [], source })
          props.regexpsList.push(regExps)
        }
      }
      for (const [name, { regexpsList, locationLink, source }] of Object.entries(propsByName)) {
        const regexps: StringOrRegExp[] = regexpsList.reduce<StringOrRegExp[]>((prev, current) => {
          if (Array.isArray(current)) {
            return prev.concat(...current)
          } else {
            return prev.concat(current)
          }
        }, [])
        const parameterType = makeParameterType(name, regexps)
        const parameterTypeLink: ParameterTypeLink = { parameterType, locationLink }
        callback(parameterTypeLink, source)
      }
    }
  }

  eachStepDefinitionExpression(
    callback: (
      stepDefinitionExpression: StringOrRegExp,
      rootNode: TreeSitterSyntaxNode,
      expressionNode: TreeSitterSyntaxNode,
      source: Source<LanguageName>
    ) => void
  ) {
    const stepDefinitionMatches = this.getSourceMatches(
      (language: Language) => language.defineStepDefinitionQueries
    )

    for (const [, sourceMatches] of stepDefinitionMatches.entries()) {
      for (const { source, match } of sourceMatches) {
        const expressionNode = syntaxNode(match, 'expression')
        const rootNode = syntaxNode(match, 'root')
        if (expressionNode && rootNode) {
          const language = getLanguage(source.languageName)
          const stepDefinitionExpression = language.toStepDefinitionExpression(expressionNode)
          if (stepDefinitionExpression !== NO_EXPRESSION) {
            callback(stepDefinitionExpression, rootNode, expressionNode, source)
          }
        }
      }
    }
  }

  private getSourceMatches(
    getQueryStrings: GetQueryStrings
  ): Map<Language, readonly SourceMatch[]> {
    const result = new Map<Language, SourceMatch[]>()
    for (const source of this.sources) {
      this.parserAdapter.setLanguageName(source.languageName)
      let tree: TreeSitterTree
      try {
        tree = this.parse(source)
      } catch (err) {
        err.message += `
uri: ${source.uri}
language: ${source.languageName}
`
        this.errors.push(err)
        continue
      }

      const language = getLanguage(source.languageName)
      const queryStrings = getQueryStrings(language)
      for (const queryString of queryStrings) {
        const query = this.parserAdapter.query(queryString)
        const matches = query.matches(tree.rootNode)
        for (const match of matches) {
          const sourceMatches: SourceMatch[] = result.get(language) || []
          result.set(language, sourceMatches)
          sourceMatches.push({ source, match })
        }
      }
    }
    return result
  }

  getErrors(): readonly Error[] {
    return this.errors
  }

  private parse(source: Source<LanguageName>): TreeSitterTree {
    let tree: TreeSitterTree | undefined = this.treeByContent.get(source)
    if (!tree) {
      this.treeByContent.set(source, (tree = this.parserAdapter.parser.parse(source.content)))
    }
    return tree
  }
}

type ParameterTypeLinkProps = {
  source: Source<LanguageName>
  regexpsList: RegExps[]
  locationLink: LocationLink
}
