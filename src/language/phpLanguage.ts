import { GeneratedExpression } from '@cucumber/cucumber-expressions'

import { Language } from './types.js'

export const phpLanguage: Language = {
  // Empty array because Behat does not support Cucumber Expressions
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `
(
  (comment)+ @expression
  (#match? @expression "Given|When|Then")
)
`,
  ],
  toStringOrRegExp(s: string): string | RegExp {
    // match multiline comment
    const match = s.match(/^(\/\*\*[\s*]*)([\s\S]*)(\n[\s]*\*\/)/)
    if (!match) throw new Error(`Could not match ${s}`)
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
     * {{ stepKeyword }} {{ expression }}
     */
    public function {{ #snakeName }}({{ #parameters }}{{ name }}{{ #seenParameter }}, {{ /seenParameter }}{{ /parameters }})
    {
      // {{ blurb }}
    }
`,
}
