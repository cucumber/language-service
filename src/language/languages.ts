import { csharpLanguage } from './csharpLanguage.js'
import { goLanguage } from './goLanguage.js'
import { javaLanguage } from './javaLanguage.js'
import { javascriptLanguage } from './javascriptLanguage.js'
import { phpLanguage } from './phpLanguage.js'
import { pythonLanguage } from './pythonLanguage.js'
import { rubyLanguage } from './rubyLanguage.js'
import { rustLanguage } from './rustLanguage.js'
import { scalaLanguage } from './scalaLanguage.js'
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
  javascript: javascriptLanguage,
  go: goLanguage,
  scala: scalaLanguage,
}

export function getLanguage(languageName: LanguageName): Language {
  return languageByName[languageName]
}
