import Parser from 'web-tree-sitter'

import { LanguageName, LanguageNames, ParserAdapter } from './types.js'

export class WasmParserAdapter implements ParserAdapter {
  // @ts-ignore
  public parser: Parser
  private languages: Record<LanguageName, Parser.Language>

  async init(wasmBaseUrl: string) {
    await Parser.init()
    this.parser = new Parser()

    const languages = await Promise.all(
      LanguageNames.map((languageName) => {
        const wasmUrl = `${wasmBaseUrl}/${languageName}.wasm`
        return Parser.Language.load(wasmUrl)
      })
    )
    // @ts-ignore
    this.languages = Object.fromEntries(
      LanguageNames.map((languageName, i) => [languageName as LanguageName, languages[i]])
    )
  }

  // @ts-ignore
  query(source: string): Parser.Query {
    return this.parser.getLanguage().query(source)
  }

  setLanguage(language: LanguageName): void {
    this.parser.setLanguage(this.languages[language])
  }
}
