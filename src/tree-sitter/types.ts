export type ParameterTypeMeta = { name: string; regexp: string }

export type LanguageName = 'java' | 'typescript'

export type Source = {
  language: LanguageName
  content: string
}

export type WasmUrls = Record<LanguageName, string>

export type TreeSitterQueries = {
  defineParameterTypeQueries: readonly string[]
  defineStepDefinitionQueries: readonly string[]
}
