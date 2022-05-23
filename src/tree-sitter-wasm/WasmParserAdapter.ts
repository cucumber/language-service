import NodeParser from 'tree-sitter'
import Parser from 'web-tree-sitter'

import { LanguageName, LanguageNames, ParserAdapter } from '../language/types.js'

export class WasmParserAdapter implements ParserAdapter {
  public parser: NodeParser
  private languages: Record<LanguageName, Parser.Language>

  constructor(private readonly wasmBaseUrl: string) {}

  async init() {
    await Parser.init()
    // @ts-ignore
    this.parser = new Parser()

    const languages = await Promise.all(
      LanguageNames.map((languageName) => {
        const wasmUrl = `${this.wasmBaseUrl}/${languageName}.wasm`
        return Parser.Language.load(wasmUrl)
      })
    )
    // @ts-ignore
    this.languages = Object.fromEntries(
      LanguageNames.map((languageName, i) => [languageName as LanguageName, languages[i]])
    )
  }

  query(source: string): NodeParser.Query {
    return this.parser.getLanguage().query(source)
  }

  setLanguage(language: LanguageName): void {
    this.parser.setLanguage(this.languages[language])
  }
}
