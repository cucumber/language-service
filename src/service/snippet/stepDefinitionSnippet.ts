import { GeneratedExpression } from '@cucumber/cucumber-expressions'
import mustache from 'mustache'

import { ParameterTypeName, SnippetParameters } from '../../language'

type TemplateContext = {
  stepKeyword: string
  camelName: string
  snakeName: string
  expression: string
  parameters: readonly Parameter[]
  seenParameter: () => boolean
  blurb: string
}

type Parameter = {
  name: string
  type: string
}

const blurb = 'Write code here that turns the phrase above into concrete actions'

export function stepDefinitionSnippet(
  stepKeyword: string,
  generatedExpressions: readonly GeneratedExpression[],
  mustacheTemplate: string,
  snippetParameters: SnippetParameters
): string {
  // TODO: Add the remaining ones as comments
  const generatedExpression = generatedExpressions[0]
  const words = generatedExpression.source.replace(/[^a-zA-Z_]+/g, ' ').split(/\s+/)
  const camelName = words
    .map((word, i) => (i === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1)))
    .join('')
  const snakeName = words.map((word, i) => (i === 0 ? word : `_${word}`)).join('')
  let _seenParameter = false
  const context: TemplateContext = {
    stepKeyword: stepKeyword.trim(), // Remove the trailing space - never used in code generation
    camelName,
    snakeName,
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
  }
  return mustache.render(mustacheTemplate, context)
}
