import Parser, { Query } from 'tree-sitter'
// @ts-ignore
import Csharp from 'tree-sitter-c-sharp'
// @ts-ignore
import Java from 'tree-sitter-java'
// @ts-ignore
import TypeScript from 'tree-sitter-typescript'

import { LanguageName, ParserAdapter } from './types'

export class NodeParserAdapter implements ParserAdapter {
  readonly parser = new Parser()

  query(source: string): Parser.Query {
    return new Query(this.parser.getLanguage(), source)
  }

  setLanguage(language: LanguageName): void {
    switch (language) {
      case 'java':
        this.parser.setLanguage(Java)
        break
      case 'typescript':
        this.parser.setLanguage(TypeScript.typescript)
        break
      case 'csharp':
        this.parser.setLanguage(Csharp)
        break
      default:
        throw new Error(`Unsupported language: ${language}`)
    }
  }
}
