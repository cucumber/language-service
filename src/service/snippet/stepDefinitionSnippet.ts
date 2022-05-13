import mustache from 'mustache'

import { GeneratedExpression } from '../../../../cucumber-expressions/javascript'

type TemplateContext = {
  expression: string
  parameters: readonly Parameter[]
}

type Parameter = {
  name: string
  type: string
}

export type ParameterTypeName =
  | 'int'
  | 'float'
  | 'word'
  | 'string'
  | 'double'
  | 'bigdecimal'
  | 'byte'
  | 'short'
  | 'long'
  | 'biginteger'
  | ''
export type Types = Record<ParameterTypeName, string>
export type Names = Partial<Record<ParameterTypeName, string>>

export function stepDefinitionSnippet(
  generatedExpression: GeneratedExpression,
  mustacheTemplate: string,
  types: Types,
  names: Names
) {
  const context: TemplateContext = {
    expression: generatedExpression.source,
    parameters: generatedExpression.parameterInfos.map((parameterInfo) => {
      const name =
        names[(parameterInfo.name as ParameterTypeName) || ''] || parameterInfo.name || names['']
      const type =
        types[(parameterInfo.name as ParameterTypeName) || ''] || parameterInfo.type || types['']
      return {
        name: `${name}${parameterInfo.nameSuffix}`,
        type,
      }
    }),
  }
  return mustache.render(mustacheTemplate, context)
}
