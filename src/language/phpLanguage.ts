import { Language } from './types.js'

export const phpLanguage: Language = {
  // Empty array because Behat does not support Cucumber Expressions
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `
(
  (comment)+ @expression
  (#match? @expression "Given|When|Then")
) @root
`,
  ],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  convertParameterTypeExpression(expression) {
    throw new Error('Unsupported operation')
  },
  convertStepDefinitionExpression(expression) {
    // match multiline comment
    const match = expression.match(/^(\/\*\*[\s*]*)([\s\S]*)(\n[\s]*\*\/)/)
    if (!match) throw new Error(`Could not match ${expression}`)
    return new RegExp(match[2].replace(/@(Given |When |Then )/, '').trim())
  },

  snippetParameters: {
    int: { type: 'int', name: 'i' },
    float: { type: 'float', name: 'f' },
    word: { type: 'string' },
    string: { type: 'string', name: 's' },
    double: { type: 'float', name: 'd' },
    bigdecimal: { type: 'string', name: 'bigDecimal' },
    byte: { type: 'int', name: 'b' },
    short: { type: 'int', name: 's' },
    long: { type: 'int', name: 'l' },
    biginteger: { type: 'int', name: 'bigInteger' },
    '': { type: 'Object', name: 'arg' },
  },
  defaultSnippetTemplate: `
    /**
     * {{ keyword }} {{ expression }}
     */
    public function {{ #camelize }}{{ expression }}{{ /camelize }}({{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}{{ /parameters }})
    {
        // {{ blurb }}
    }
`,
}
