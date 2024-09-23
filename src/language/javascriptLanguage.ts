import { tsxLanguage } from './tsxLanguage.js'
import { Language } from './types.js'

export const javascriptLanguage: Language = {
  ...tsxLanguage,
  defineStepDefinitionQueries: [
    ...tsxLanguage.defineStepDefinitionQueries,
    // Compiled cjs step definitions of the format:
    // (0, some_cucumber_import.Given)("step pattern here", function...)
    `(call_expression
      function: (parenthesized_expression
        (sequence_expression
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
    ) @root`,
    // Compiled cjs step definitions of the format:
    // (0, Given)("step pattern here", function...)
    `(call_expression
      function: (parenthesized_expression
        (sequence_expression
          (identifier) @function-name
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
    ) @root`,
  ],
  defaultSnippetTemplate: `
{{ keyword }}('{{ expression }}', ({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}{{ /parameters }}) => {
  // {{ blurb }}
})
`,
}
