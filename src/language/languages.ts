import { csharpLanguage } from './csharpLanguage.js'
import { javaLanguage } from './javaLanguage.js'
import { phpLanguage } from './phpLanguage.js'
import { rubyLanguage } from './rubyLanguage.js'
import { LanguageName, TreeSitterLanguage } from './types.js'
import { typescriptLanguage } from './typescriptLanguage.js'

const treeSitterLanguageByName: Record<LanguageName, TreeSitterLanguage> = {
  java: javaLanguage,
  typescript: typescriptLanguage,
  c_sharp: csharpLanguage,
  php: phpLanguage,
  ruby: rubyLanguage,
}

export function getLanguage(languageName: LanguageName): TreeSitterLanguage {
  return treeSitterLanguageByName[languageName]
}
