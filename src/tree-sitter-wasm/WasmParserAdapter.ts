import WasmParser from 'web-tree-sitter'

import { LanguageName, LanguageNames, ParserAdapter } from '../language/types.js'

export class WasmParserAdapter implements ParserAdapter {
  public parser: WasmParser
  private languages: Record<LanguageName, WasmParser.Language>

  constructor(private readonly wasmBaseUrl: string) {}

  async init() {
    await WasmParser.init()
    this.parser = new WasmParser()

    const languages = await Promise.all(
      LanguageNames.map((languageName) => {
        const wasmUrl = `${this.wasmBaseUrl}/${languageName}.wasm`
        try {
          return WasmParser.Language.load(wasmUrl)
        } catch (err) {
          console.error(`Failed to load ${wasmUrl}: ${err.message}`)
        }
      })
    )
    // @ts-ignore
    this.languages = Object.fromEntries(
      LanguageNames.map((languageName, i) => [languageName as LanguageName, languages[i]])
    )
  }

  query(source: string) {
    return this.parser.getLanguage().query(source)
  }

  setLanguageName(languageName: LanguageName) {
    this.parser.setLanguage(this.languages[languageName])
  }
}
