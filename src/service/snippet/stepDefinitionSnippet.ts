import { GeneratedExpression } from '@cucumber/cucumber-expressions'
import mustache from 'mustache'

import { ParameterTypeName, SnippetParameters } from '../../language'

type MustacheFunction = () => (text: string, render: (text: string) => string) => string

type TemplateContext = {
  keyword: string
  expression: string
  parameters: readonly Parameter[]
  seenParameter: () => boolean
  blurb: string
  camelize: MustacheFunction
  underscore: MustacheFunction
  capitalize: MustacheFunction
}

type Parameter = {
  name: string
  type: string
}

function toWords(expression: string) {
  return expression
    .replace(/{[^}]*}/g, ' ')
    .replace(/[^a-zA-Z_]+/g, ' ')
    .trim()
    .split(/\s+/)
}

const camelize: MustacheFunction = () => (text, render) =>
  toWords(render(text))
    .map((word, i) => (i === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1)))
    .join('')

const underscore: MustacheFunction = () => (text, render) =>
  toWords(render(text))
    .map((word, i) => (i === 0 ? word : `_${word}`))
    .join('')

const capitalize: MustacheFunction = () => (text, render) => {
  const rendered = render(text)
  return rendered[0].toUpperCase() + rendered.slice(1)
}

const blurb = 'Write code here that turns the phrase above into concrete actions'

export function stepDefinitionSnippet(
  keyword: string,
  generatedExpressions: readonly GeneratedExpression[],
  mustacheTemplate: string,
  snippetParameters: SnippetParameters
): string {
  // TODO: Add the remaining ones as comments
  const generatedExpression = generatedExpressions[0]

  let _seenParameter = false
  const context: TemplateContext = {
    keyword: keyword.trim(), // Remove the trailing space - never used in code generation
    expression: generatedExpression.source,
    parameters: generatedExpression.parameterInfos.map((parameterInfo) => {
      const snippetParameter = snippetParameters[(parameterInfo.name as ParameterTypeName) || '']
      const name = snippetParameter?.name || parameterInfo.name || snippetParameters[''].name
      const type = snippetParameter?.type || parameterInfo.name || snippetParameters[''].type
      return {
        name: `${name}${parameterInfo.count === 1 ? '' : parameterInfo.count.toString()}`,
        type,
      }
    }),
    seenParameter() {
      try {
        return _seenParameter
      } finally {
        _seenParameter = true
      }
    },
    blurb,
    camelize,
    underscore,
    capitalize,
  }
  return mustache.render(mustacheTemplate, context)
}
