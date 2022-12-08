import { tsxLanguage } from './tsxLanguage.js'
import { Language } from './types.js'

export const javascriptLanguage: Language = {
  ...tsxLanguage,
  defaultSnippetTemplate: `
{{ keyword }}('{{ expression }}', ({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}{{ /parameters }}) => {
  // {{ blurb }}
})
`,
}
