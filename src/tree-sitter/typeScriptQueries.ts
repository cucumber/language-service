import { TreeSitterQueries } from './buildExpressions.js'

export const typeScriptQueries: TreeSitterQueries = {
  defineParameterTypeQuery: `
(call_expression
  function: (identifier) @function-name
  arguments: (arguments
    (object
      [
        (
          (pair
            key: (property_identifier) @string-key
            value: (string) @name
          )
          (pair
            key: (property_identifier) @regex-key
            value: (regex) @regexp
          )
        )
        (
          (pair
            key: (property_identifier) @regex-key
            value: (regex) @regexp
          )
          (pair
            key: (property_identifier) @string-key
            value: (string) @name
          )
        )
      ]
    )
  )
  (#eq? @function-name "defineParameterType")
  (#eq? @string-key "name")
  (#eq? @regex-key "regexp")
)
`,
  defineStepDefinitionQuery: `
(call_expression
  function: (identifier) @function-name
  arguments: (arguments
    [
      (string) @cucumber-expression
      (regex) @regular-expression
    ]
  )
  (#match? @function-name "Given|When|Then")
)
`,
}
