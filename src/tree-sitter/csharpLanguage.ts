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
    const match = s.match(/^([@$'"]+)(.*)"$/)
    if (!match) throw new Error(`Could not match ${s}`)
    return new RegExp(match[2])
  },
}
