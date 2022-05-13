import { GeneratedExpression } from '@cucumber/cucumber-expressions'

import { TreeSitterLanguage } from './types.js'

export const phpLanguage: TreeSitterLanguage = {
  // Empty array because Behat does not support Cucumber Expressions
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `
(
  (comment)+ @expression
  (#match? @expression "Given|When|Then")
)
`,
  ],
  toStringOrRegExp(s: string): string | RegExp {
    // match multiline comment
    const match = s.match(/^(\/\*\*[\s*]*)([\s\S]*)(\n[\s]*\*\/)/)
    if (!match) throw new Error(`Could not match ${s}`)
    return new RegExp(match[2].replace(/@(Given |When |Then )/, '').trim())
  },

  generateSnippet(expression: GeneratedExpression): string {
    return `
        [Given(@"${expression.source}")]
        public void todo_rename() {
        }
`
  },
}
