import { TreeSitterLanguage } from './types.js'

export const csharpLanguage: TreeSitterLanguage = {
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `
(method_declaration (attribute_list
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
  toStringOrRegExp(s: string): string | RegExp {
    // Specflow step definitions may have embedded regex patterns in braces
    // TODO: Need to be more robust in escaping backslashes in these expressions
    const cucumberCompatibleString = s.replace(/(\(\\d\+\))/g, `(\\\\d+)`)
    const match = cucumberCompatibleString.match(/^([@$'"]+)(.*)"$/)
    if (!match) throw new Error(`Could not match ${s}`)
    return match[2]
  },
}
