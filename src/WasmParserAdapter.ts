import { Language, Parser, Query } from 'web-tree-sitter'

import { type LanguageName, LanguageNames, type ParserAdapter } from './language/types.js'

export class WasmParserAdapter implements ParserAdapter {
  public parser!: Parser
  private languages!: Record<LanguageName, Language>

  constructor(private readonly wasmBaseUrl: string) {}

  async init() {
    await Parser.init()
    this.parser = new Parser()

    const languages = await Promise.all(
      LanguageNames.map((languageName) => {
        let wasmName: LanguageName
        switch (languageName) {
          case 'javascript':
            wasmName = 'tsx'
            break
          default:
            wasmName = languageName
        }

        const wasmUrl = `${this.wasmBaseUrl}/${wasmName}.wasm`
        try {
          return Language.load(wasmUrl)
        } catch (err) {
          console.error(`Failed to load ${wasmUrl}: ${(err as Error).message}`)
          return undefined
        }
      })
    )
    // @ts-ignore
    this.languages = Object.fromEntries(
      LanguageNames.map((languageName, i) => [languageName as LanguageName, languages[i]])
    )
  }

  query(source: string) {
    if (!this.parser.language) {
      throw new Error('No language set on parser')
    }
    return new Query(this.parser.language, source)
  }

  setLanguageName(languageName: LanguageName) {
    this.parser.setLanguage(this.languages[languageName])
  }
}
