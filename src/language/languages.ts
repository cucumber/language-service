import { csharpLanguage } from './csharpLanguage.js'
import { javaLanguage } from './javaLanguage.js'
import { phpLanguage } from './phpLanguage.js'
import { pythonLanguage } from './pythonLanguage.js'
import { rubyLanguage } from './rubyLanguage.js'
import { rustLanguage } from './rustLanguage.js'
import { tsxLanguage } from './tsxLanguage.js'
import { Language, LanguageName } from './types.js'

const languageByName: Record<LanguageName, Language> = {
  java: javaLanguage,
  tsx: tsxLanguage,
  c_sharp: csharpLanguage,
  php: phpLanguage,
  ruby: rubyLanguage,
  rust: rustLanguage,
  python: pythonLanguage,
}

export function getLanguage(languageName: LanguageName): Language {
  return languageByName[languageName]
}
