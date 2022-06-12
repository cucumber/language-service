import { StringOrRegExp } from '@cucumber/cucumber-expressions'
import { LocationLink } from 'vscode-languageserver-types'

import { createLocationLink, makeParameterType, stripQuotes } from './helpers.js'
import { Language, ParameterTypeLink, TreeSitterQueryMatch, TreeSitterSyntaxNode } from './types.js'

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
              [
                (verbatim_string_literal) 
                (string_literal)
              ] @expression
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
    return convertExpression(expression)
  },
  convertStepDefinitionExpression(expression) {
    return convertExpression(expression)
  },
  buildParameterTypeLinks(matches) {
    const parameterTypeLinks: ParameterTypeLink[] = []
    const propsByName: Record<string, ParameterTypeLinkProps> = {}
    for (const { source, match } of matches) {
      const nameNode = syntaxNode(match, 'name')
      const expressionNode = syntaxNode(match, 'expression')
      const rootNode = syntaxNode(match, 'root')
      if (nameNode && rootNode) {
        // SpecFlow allows definition of parameter types (StepArgumentTransformation) without specifying an expression
        // See https://github.com/gasparnagy/CucumberExpressions.SpecFlow/blob/a2354d2175f5c632c9ae4a421510f314efce4111/CucumberExpressions.SpecFlow.SpecFlowPlugin/Expressions/UserDefinedCucumberExpressionParameterTypeTransformation.cs#L25-L27
        const parameterTypeName = stripQuotes(nameNode.text)
        const selectionNode = expressionNode || nameNode
        const locationLink = createLocationLink(rootNode, selectionNode, source.uri)
        const props: ParameterTypeLinkProps = (propsByName[parameterTypeName] = propsByName[
          parameterTypeName
        ] || { locationLink, regexps: [] })
        const parameterTypeExpression = expressionNode ? expressionNode.text : null
        props.regexps.push(this.convertParameterTypeExpression(parameterTypeExpression))

        // const parameterType = makeParameterType(
        //   parameterTypeName,
        //   this.convertParameterTypeExpression(parameterTypeExpression)
        // )
      }
    }
    for (const [name, { regexps, locationLink }] of Object.entries(propsByName)) {
      const parameterType = makeParameterType(name, regexps)
      parameterTypeLinks.push({ parameterType, locationLink })
    }
    return parameterTypeLinks
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

function convertExpression(expression: string) {
  const match = expression.match(/^(@)?"(.*)"$/)
  if (!match) throw new Error(`Could not match ${expression}`)
  if (match[1] === '@') {
    return new RegExp(unescapeVerbatimString(match[2]))
  } else {
    return unescapeString(match[2])
  }
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

type ParameterTypeLinkProps = {
  regexps: StringOrRegExp[]
  locationLink: LocationLink
}

function syntaxNode(match: TreeSitterQueryMatch, name: string): TreeSitterSyntaxNode | undefined {
  return match.captures.find((c) => c.name === name)?.node
}
