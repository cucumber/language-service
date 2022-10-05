// @ts-ignore
import Parser, { Query } from 'tree-sitter'
// @ts-ignore
import Csharp from 'tree-sitter-c-sharp'
// @ts-ignore
import Java from 'tree-sitter-java'
// @ts-ignore
import Php from 'tree-sitter-php'
// @ts-ignore
import Python from 'tree-sitter-python'
// @ts-ignore
import Ruby from 'tree-sitter-ruby'
// @ts-ignore
import Rust from 'tree-sitter-rust'
// @ts-ignore
import TypeScript from 'tree-sitter-typescript'

import { LanguageName, ParserAdapter } from '../language/types.js'

export class NodeParserAdapter implements ParserAdapter {
  readonly parser = new Parser()

  query(source: string): Parser.Query {
    return new Query(this.parser.getLanguage(), source)
  }

  setLanguageName(languageName: LanguageName): void {
    switch (languageName) {
      case 'java':
        this.parser.setLanguage(Java)
        break
      case 'tsx':
        this.parser.setLanguage(TypeScript.typescript)
        break
      case 'c_sharp':
        this.parser.setLanguage(Csharp)
        break
      case 'php':
        this.parser.setLanguage(Php)
        break
      case 'ruby':
        this.parser.setLanguage(Ruby)
        break
      case 'python':
        this.parser.setLanguage(Python)
        break
      case 'rust':
        this.parser.setLanguage(Rust)
        break
      default:
        throw new Error(`Unsupported language: ${languageName}`)
    }
  }

  init(): Promise<void> {
    return Promise.resolve(undefined)
  }
}
