import { StringOrRegExp } from '@cucumber/cucumber-expressions'

import { childrenToString, NO_QUOTES } from './helpers.js'
import { Language, TreeSitterSyntaxNode } from './types.js'

export const csharpLanguage: Language = {
  toParameterTypeName(node: TreeSitterSyntaxNode) {
    switch (node.type) {
      case 'identifier': {
        return node.text
      }
    }
    return childrenToString(node, NO_QUOTES)
  },
  toParameterTypeRegExps(node) {
    if (node === null) {
      return /.*/
    }

    switch (node.type) {
      case 'verbatim_string_literal': {
        const s = node.text.slice(2, -1)
        return new RegExp(unescapeVerbatimString(s))
      }
      case 'string_literal': {
        const s = node.text.slice(1, -1)
        return new RegExp(unescapeString(s))
      }
      default:
        throw new Error(`Unexpected type: ${node.type}`)
    }
  },
  toStepDefinitionExpression(node: TreeSitterSyntaxNode): StringOrRegExp {
    switch (node.type) {
      case 'verbatim_string_literal': {
        const s = node.text.slice(2, -1)
        return new RegExp(unescapeVerbatimString(s))
      }
      case 'string_literal': {
        return unescapeString(node.text.slice(1, -1))
      }
      default:
        throw new Error(`Unexpected type: ${node.type}`)
    }
  },
  defineParameterTypeQueries: [
    `
    (method_declaration
      (attribute_list
        (attribute
          name: (identifier) @attribute-name
          (attribute_argument_list
            (attribute_argument
              [
                (verbatim_string_literal) 
                (string_literal)
              ] @expression
            )
          )?
        )
      )
      returns: (identifier) @name
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

// C# verbatim strings escape " as "". Unescape "" back to ".
// https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/verbatim
function unescapeVerbatimString(s: string): string {
  return s.replace(/""/g, '"')
}

// TODO(@aslakhellesoy) not sure if this is correct.
function unescapeString(s: string): string {
  return s.replace(/\\\\/g, '\\')
}
