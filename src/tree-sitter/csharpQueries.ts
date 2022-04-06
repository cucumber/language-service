import { TreeSitterQueries } from './types.js'

export const csharpQueries: TreeSitterQueries = {
  defineParameterTypeQueries: [
    `
(method_declaration
  (attribute_list
    [
      (attribute
        name: (identifier) @annotation-name
        (attribute_argument_list
          (attribute_argument
            (verbatim_string_literal) @expression
          )
        )
      )
      (attribute
        name: (identifier) @annotation-name
      )
    ]
  )
  name: (identifier) @name
  parameters: (parameter_list
    [
      (parameter
        type: (predefined_type)
        name: (identifier)
      )
    ]
  )
  (#eq? @annotation-name "StepArgumentTransformation")
)
`,
  ],
  defineStepDefinitionQueries: [
    `
(method_declaration
  (attribute_list
    (attribute
      name: (identifier) @annotation-name
      (attribute_argument_list
        (attribute_argument
          (verbatim_string_literal)
        )
      )
    )
  )
  (#match? @annotation-name "Given|When|Then|And|But|StepDefinition")
)
`,
  ],
}
