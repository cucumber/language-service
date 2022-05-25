import { Language } from './types.js'

export const csharpLanguage: Language = {
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
) @root
`,
  ],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  convertParameterTypeExpression(s) {
    throw new Error('Unsupported operation')
  },
  convertStepDefinitionExpression(s) {
    const match = s.match(/^([@$'"]+)(.*)"$/)
    if (!match) throw new Error(`Could not match ${s}`)
    return new RegExp(match[2])
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
    [{{ stepKeyword }}("{{ expression }}")]
    public void {{ camelName }}({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ type }} {{ name }}{{ /parameters }})
    {
        // {{ blurb }}
    }
`,
}
