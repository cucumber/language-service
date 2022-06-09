import { Language } from './types.js'

export const csharpLanguage: Language = {
  // Empty array because SpecFlow does not support Cucumber Expressions out of the box
  // They are supported via CucumberExpressions.SpecFlow - see https://github.com/cucumber/language-service/pull/29#discussion_r858319308
  // so we could add support for this in the future
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
    const regExp = unescapeRegExp(match[1])
    return regExp
  },
  convertStepDefinitionExpression(s) {
    const regexParamMatch = s.match(/(\([^)]+[*+]\)|\.\*)/)
    const regexExpressionMatch = s.match(/^@"(\^.*\$)"$/)

    if (regexExpressionMatch || regexParamMatch) {
      // For regex step definitions, the string always needs to be verbatim_string_literal (i.e. Prefixed with an '@')
      return new RegExp(s.substring(2, s.length - 1))
    }

    const exprStart = s.startsWith('@') ? 2 : 1
    return s.substring(exprStart, s.length - 1)
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
function unescapeRegExp(regexp: string): RegExp {
  return new RegExp(regexp.replace(/\\\\/g, '\\'))
}
