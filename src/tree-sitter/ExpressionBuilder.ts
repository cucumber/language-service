import {
  ExpressionFactory,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import { resolve } from 'path'
import Parser, { SyntaxNode } from 'tree-sitter'
import { Range } from 'vscode-languageserver-types'

import { csharpLanguage } from './csharpLanguage.js'
import { javaLanguage } from './javaLanguage.js'
import { phpLanguage } from './phpLanguage.js'
import { rubyLanguage } from './rubyLanguage.js'
import {
  ExpressionBuilderResult,
  ExpressionLink,
  LanguageName,
  ParameterTypeMeta,
  ParserAdapter,
  PartialLocationLink,
  Source,
  TreeSitterLanguage,
} from './types.js'
import { typescriptLanguage } from './typescriptLanguage.js'

const treeSitterLanguageByName: Record<LanguageName, TreeSitterLanguage> = {
  java: javaLanguage,
  typescript: typescriptLanguage,
  c_sharp: csharpLanguage,
  php: phpLanguage,
  ruby: rubyLanguage,
}

export class ExpressionBuilder {
  constructor(private readonly parserAdapter: ParserAdapter) {}

  build(
    sources: readonly Source<LanguageName>[],
    parameterTypes: readonly ParameterTypeMeta[]
  ): ExpressionBuilderResult {
    const expressionLinks: ExpressionLink[] = []
    const errors: Error[] = []
    const parameterTypeRegistry = new ParameterTypeRegistry()
    const expressionFactory = new ExpressionFactory(parameterTypeRegistry)

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
        parameterTypeRegistry.defineParameterType(parameterType)
      } catch (err) {
        errors.push(err)
      }
    }

    for (const parameterType of parameterTypes) {
      defineParameterType(makeParameterType(parameterType.name, new RegExp(parameterType.regexp)))
    }

    for (const source of sources) {
      this.parserAdapter.setLanguage(source.language)
      let tree: Parser.Tree
      try {
        tree = parse(source)
      } catch (err) {
        err.message += `\npath: ${source.path}`
        errors.push(err)
        continue
      }

      const treeSitterLanguage = treeSitterLanguageByName[source.language]
      for (const defineParameterTypeQuery of treeSitterLanguage.defineParameterTypeQueries) {
        const query = this.parserAdapter.query(defineParameterTypeQuery)
        const matches = query.matches(tree.rootNode)
        for (const match of matches) {
          const nameNode = syntaxNode(match, 'name')
          const regexpNode = syntaxNode(match, 'expression')
          if (nameNode && regexpNode) {
            defineParameterType(
              makeParameterType(
                toString(nameNode.text),
                treeSitterLanguage.toStringOrRegExp(regexpNode.text)
              )
            )
          }
        }
      }
    }

    for (const source of sources) {
      this.parserAdapter.setLanguage(source.language)
      const tree = treeByContent.get(source)
      if (!tree) {
        continue
      }

      const treeSitterLanguage = treeSitterLanguageByName[source.language]
      for (const defineStepDefinitionQuery of treeSitterLanguage.defineStepDefinitionQueries) {
        const query = this.parserAdapter.query(defineStepDefinitionQuery)
        const matches = query.matches(tree.rootNode)
        for (const match of matches) {
          const expressionNode = syntaxNode(match, 'expression')
          if (expressionNode) {
            const stringOrRegexp = treeSitterLanguage.toStringOrRegExp(expressionNode.text)
            try {
              const expression = expressionFactory.createExpression(stringOrRegexp)
              const targetRange: Range = Range.create(
                expressionNode.startPosition.row,
                expressionNode.startPosition.column,
                expressionNode.endPosition.row,
                expressionNode.endPosition.column
              )
              const partialLink: PartialLocationLink = {
                targetRange,
                targetSelectionRange: targetRange,
                targetUri: `file://${resolve(source.path)}`,
              }
              expressionLinks.push({ expression, partialLink })
            } catch (err) {
              errors.push(err)
            }
          }
        }
      }
    }

    return {
      expressionLinks,
      errors,
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
  return new ParameterType(name, regexp, Object, () => undefined, false, false)
}
