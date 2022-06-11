import { Language } from './types.js'

export const csharpLanguage: Language = {
  defineParameterTypeQueries: [
    // [StepArgumentTransformation(@"blabla")]
    `
    (method_declaration
      (attribute_list
        (attribute
          name: (identifier) @attribute-name
          (attribute_argument_list
            (attribute_argument
              (verbatim_string_literal) @expression
            )
          )
        )
      )
      type: (identifier) @name
      (#eq? @attribute-name "StepArgumentTransformation")
    ) @root
    `,
    // [StepArgumentTransformation]
    `
    (method_declaration
      (attribute_list
        (attribute
          name: (identifier) @attribute-name
          .
        )
      )
      type: (identifier) @name
      (#eq? @attribute-name "StepArgumentTransformation")
    ) @root
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
          (verbatim_string_literal) @expression
        )
      )
    )
  )
  (#match? @annotation-name "Given|When|Then|And|But|StepDefinition")
) @root
`,
    `
(method_declaration
  (attribute_list
    (attribute
      name: (identifier) @annotation-name
      (attribute_argument_list
        (attribute_argument
          (string_literal) @expression
        )
      )
    )
  )
  (#match? @annotation-name "Given|When|Then|And|But|StepDefinition")
) @root
`,
  ],
  convertParameterTypeExpression(expression) {
    if (expression === null) {
      // https://github.com/gasparnagy/CucumberExpressions.SpecFlow/blob/a2354d2175f5c632c9ae4a421510f314efce4111/CucumberExpressions.SpecFlow.SpecFlowPlugin/Expressions/CucumberExpressionParameterType.cs#L10
      return /.*/
    }
    const match = expression.match(/^@"(.*)"$/)
    if (!match) throw new Error(`Could not match ${expression}`)
    return new RegExp(unescapeString(match[1]))
  },
  convertStepDefinitionExpression(expression) {
    const match = expression.match(/^(@)?"(.*)"$/)
    if (!match) throw new Error(`Could not match ${expression}`)
    if (match[1] === '@') {
      return new RegExp(unescapeString(match[2]))
    } else {
      return unescapeString(match[2])
    }
  },

  snippetParameters: {
    int: { type: 'int', name: 'i' },
    float: { type: 'float', name: 'f' },
    word: { type: 'string' },
    string: { type: 'string', name: 's' },
    double: { type: 'double', name: 'd' },
    bigdecimal: { type: 'BigDecimal', name: 'bigDecimal' },
    byte: { type: 'byte', name: 'b' },
    short: { type: 'short', name: 's' },
    long: { type: 'long', name: 'l' },
    biginteger: { type: 'BigInteger', name: 'bigInteger' },
    '': { type: 'object', name: 'arg' },
  },

  defaultSnippetTemplate: `
    // This step definition uses Cucumber Expressions. See https://github.com/gasparnagy/CucumberExpressions.SpecFlow
    [{{ keyword }}("{{ expression }}")]
    public void {{ #capitalize }}{{ #camelize }}{{ keyword }} {{expression}}{{ /camelize }}{{ /capitalize }}({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ type }} {{ name }}{{ /parameters }})
    {
        // {{ blurb }}
    }
`,
}

// C# escapes \ as \\. Turn \\ back to \.
function unescapeString(s: string): string {
  return s.replace(/\\\\/g, '\\')
}
