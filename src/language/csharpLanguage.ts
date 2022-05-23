import { GeneratedExpression } from '@cucumber/cucumber-expressions'

import { Names, Types } from '../service/snippet/stepDefinitionSnippet'
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

  types: {
    int: 'int',
    float: 'float',
    word: 'string',
    string: 'string',
    double: 'double',
    bigdecimal: 'BigDecimal',
    byte: 'byte',
    short: 'short',
    long: 'long',
    biginteger: 'BigInteger',
    '': 'object',
  },
  names: {
    int: 'i',
    float: 'f',
    word: 'word',
    string: 's',
    double: 'd',
    bigdecimal: 'bigDecimal',
    byte: 'b',
    short: 's',
    long: 'l',
    biginteger: 'BigInt',
    '': 'arg',
  },
}