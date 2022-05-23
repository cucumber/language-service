import { csharpLanguage } from './csharpLanguage.js'
import { javaLanguage } from './javaLanguage.js'
import { phpLanguage } from './phpLanguage.js'
import { rubyLanguage } from './rubyLanguage.js'
import { Language, LanguageName } from './types.js'
import { typescriptLanguage } from './typescriptLanguage.js'

const treeSitterLanguageByName: Record<LanguageName, Language> = {
  java: javaLanguage,
  typescript: typescriptLanguage,
  c_sharp: csharpLanguage,
  php: phpLanguage,
  ruby: rubyLanguage,
}

export function getLanguage(languageName: LanguageName): Language {
  return treeSitterLanguageByName[languageName]
}
