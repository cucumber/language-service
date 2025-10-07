import { unsupportedOperation } from './helpers.js'
import { Language } from './types.js'

export const phpLanguage: Language = {
  toParameterTypeName: unsupportedOperation,
  toParameterTypeRegExps: unsupportedOperation,
  toStepDefinitionExpression(node) {
    // match multiline comment
    const text = node.text
    const match = text.match(/^(\/\*\*[\s*]*)([\s\S]*)(\n[\s]*\*\/)/)
    if (!match) throw new Error(`Could not match ${text}`)
    return behatifyStep(match[2])
  },
  // Empty array because Behat does not support Cucumber Expressions
  defineParameterTypeQueries: [],
  defineStepDefinitionQueries: [
    `
(
  (comment)+ @expression
  (#match? @expression "@(Given|When|Then)")
) @root
`,
  ],
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

export function behatifyStep(step: string): RegExp {
  const stepText = stripIdentifier(step)
  if (stepText.startsWith('/')) {
    return cleanRegExp(stepText)
  } else if (/:[A-Za-z_][\w_]+/.test(stepText)) {
    return argToRegex(stepText)
  }

  return RegExp(stepText)
}

function stripIdentifier(text: string): string {
  return text.replace(/@(Given |When |Then )/, '').trim()
}

function cleanRegExp(re: string): RegExp {
  const [body, modifier] = re.slice(1).split('/')

  return RegExp(body, modifier)
}

function argToRegex(text: string): RegExp {
  // arg must be a valid php variable name, see https://www.php.net/manual/en/language.variables.basics.php
  return RegExp(text.replace(/:[A-Za-z_][\w_]+/g, '([\\S]+|"[^"]+")'))
}
