import { GeneratedExpression } from '@cucumber/cucumber-expressions'

import { TreeSitterLanguage } from './types.js'

export const csharpLanguage: TreeSitterLanguage = {
  // Empty array because SpecFlow does not support Cucumber Expressions out of the box
  // They are supported via CucumberExpressions.SpecFlow - see https://github.com/cucumber/language-service/pull/29#discussion_r858319308
  // so we could add support for this in the future
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `
(method_declaration 
  (attribute_list
    (attribute
      name: (identifier) @annotation-name
      (attribute_argument_list
        (attribute_argument
          (verbatim_string_literal) @expression
        )
      )
    )
  )
  (#match? @annotation-name "Given|When|Then|And|But|StepDefinition")
)
`,
  ],
  toStringOrRegExp(s) {
    const match = s.match(/^([@$'"]+)(.*)"$/)
    if (!match) throw new Error(`Could not match ${s}`)
    return new RegExp(match[2])
  },

  generateSnippet(expression: GeneratedExpression): string {
    return `
        [Given(@"${expression.source}")]
        public void todo_rename() {
        }
`
  },
}
