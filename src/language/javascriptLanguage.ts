import { tsxLanguage } from './tsxLanguage.js'
import { Language } from './types.js'

export const javascriptLanguage: Language = {
  ...tsxLanguage,
  defineStepDefinitionQueries: [
    ...tsxLanguage.defineStepDefinitionQueries,
    // Matcher for compiled cjs format, with step definitions in the form:
    // (0, some_cucumber_import.Given)("step title here", function...)
    `
(call_expression
  function: (parenthesized_expression
    (sequence_expression
      (number)
      (member_expression
        property: (property_identifier) @function-name
      )
    )
  )
  arguments: (arguments
    [
      (string) @expression
      (regex) @expression
      (template_string) @expression
    ]
  )
  (#match? @function-name "Given|When|Then")
) @root
`,
  ],
  defaultSnippetTemplate: `
{{ keyword }}('{{ expression }}', ({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}{{ /parameters }}) => {
  // {{ blurb }}
})
`,
}
