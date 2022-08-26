import { buildParameterTypeLinksFromMatches } from './helpers.js'
import { Language } from './types.js'

export const phpLanguage: Language = {
  toParameterTypeName() {
    throw new Error('Unsupported operation')
  },
  toParameterTypeRegExps() {
    throw new Error('Unsupported operation')
  },
  toStepDefinitionExpression(node) {
    // match multiline comment
    const text = node.text
    const match = text.match(/^(\/\*\*[\s*]*)([\s\S]*)(\n[\s]*\*\/)/)
    if (!match) throw new Error(`Could not match ${text}`)
    return new RegExp(match[2].replace(/@(Given |When |Then )/, '').trim())
  },
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
  buildParameterTypeLinks(matches) {
    return buildParameterTypeLinksFromMatches(matches)
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
