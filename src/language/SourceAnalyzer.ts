import { getLanguage } from './languages.js'
import { Language, ParserAdapter, Source, TreeSitterQueryMatch, TreeSitterTree } from './types.js'

type GetQueryStrings = (language: Language) => readonly string[]
type SourceMatch = {
  source: Source
  match: TreeSitterQueryMatch
}

export class SourceAnalyzer {
  private readonly errors: Error[] = []
  private readonly treeByContent = new Map<Source, TreeSitterTree>()

  constructor(
    private readonly parserAdapter: ParserAdapter,
    private readonly sources: readonly Source[]
  ) {}

  getSourceMatches(getQueryStrings: GetQueryStrings): readonly SourceMatch[] {
    const sourceMatches: SourceMatch[] = []
    for (const source of this.sources) {
      this.parserAdapter.setLanguageName(source.languageName)
      let tree: TreeSitterTree
      try {
        tree = this.parse(source)
      } catch (err) {
        err.message += `\nuri: ${source.uri}`
        this.errors.push(err)
        continue
      }

      const language = getLanguage(source.languageName)
      const queryStrings = getQueryStrings(language)
      for (const queryString of queryStrings) {
        const query = this.parserAdapter.query(queryString)
        const matches = query.matches(tree.rootNode)
        for (const match of matches) {
          sourceMatches.push({ source, match })
        }
      }
    }
    return sourceMatches
  }

  getErrors(): readonly Error[] {
    return this.errors
  }

  private parse(source: Source): TreeSitterTree {
    let tree: TreeSitterTree | undefined = this.treeByContent.get(source)
    if (!tree) {
      this.treeByContent.set(source, (tree = this.parserAdapter.parser.parse(source.content)))
    }
    return tree
  }
}
