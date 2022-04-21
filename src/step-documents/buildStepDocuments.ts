import {
  CucumberExpression,
  Expression,
  Node,
  NodeType,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'

import { StepDocument } from './types.js'

type TextOrParameterTypeNameExpression = TextOrOption[]
type TextOrOption = string | Option
type Option = { type: 'parameter-type' | 'optional'; visualName: string; key: string }

/**
 * Builds an array of {@link StepDocument} from steps and step definitions.
 *
 * @param parameterTypeRegistry
 * @param stepTexts
 * @param expressions
 * @param maxChoices
 */
export function buildStepDocuments(
  parameterTypeRegistry: ParameterTypeRegistry,
  stepTexts: readonly string[],
  expressions: readonly Expression[],
  maxChoices = 10
): readonly StepDocument[] {
  const jsonTextOrParameterTypeNameExpression = new Set<string>()
  const choicesByOptionKey = new Map<string, Set<string>>()
  const expressionByJson = new Map<string, Expression>()
  const suggestionByJson = new Map<string, string>()

  for (const expression of expressions) {
    let matched = false
    for (const text of stepTexts) {
      const args = expression.match(text)
      if (args) {
        matched = true
        const parameterTypes = args.map((arg) => arg.getParameterType())
        const textOrParameterTypeNameExpression: TextOrParameterTypeNameExpression = []
        let index = 0
        for (let argIndex = 0; argIndex < args.length; argIndex++) {
          const arg = args[argIndex]

          const segment = text.substring(index, arg.group.start)
          textOrParameterTypeNameExpression.push(segment)
          const parameterType = parameterTypes[argIndex]
          const key = parameterType.regexpStrings.join('|')
          textOrParameterTypeNameExpression.push({
            type: 'parameter-type',
            visualName: parameterType.name || '',
            key: key,
          })
          let choices = choicesByOptionKey.get(key)
          if (!choices) {
            choices = new Set<string>()
            choicesByOptionKey.set(key, choices)
          }
          if (arg.group.value !== undefined) choices.add(arg.group.value)

          if (arg.group.end !== undefined) index = arg.group.end
        }
        const lastSegment = text.substring(index)
        if (lastSegment !== '') {
          textOrParameterTypeNameExpression.push(lastSegment)
        }

        const json = JSON.stringify(textOrParameterTypeNameExpression)
        expressionByJson.set(json, expression)
        const suggestion = textOrParameterTypeNameExpression
          .map((segment) => {
            if (typeof segment === 'string') {
              return segment
            } else {
              return `{${segment.visualName}}`
            }
          })
          .join('')
        suggestionByJson.set(json, suggestion)
        jsonTextOrParameterTypeNameExpression.add(json)
      }
    }
    if (!matched && expression instanceof CucumberExpression) {
      // const compiler = new SegmentCompiler(expression.source, parameterTypeRegistry)
      // const textOrParameterTypeNameExpression = compiler.compile(expression.ast)
      // const json = JSON.stringify(textOrParameterTypeNameExpression)
      // expressionByJson.set(json, expression)
      // suggestionByJson.set(json, expression.source)
      // jsonTextOrParameterTypeNameExpression.add(json)
    }
  }

  return [...jsonTextOrParameterTypeNameExpression].sort().map((json) => {
    const textOrParameterTypeNameExpression: TextOrParameterTypeNameExpression = JSON.parse(json)
    const expression = expressionByJson.get(json)
    if (!expression) throw new Error(`No expression for json key ${json}`)

    const suggestion = suggestionByJson.get(json)
    if (!suggestion) throw new Error(`No suggestion for json key ${json}`)

    const segments = textOrParameterTypeNameExpression.map((segment) => {
      if (typeof segment === 'string') {
        return segment
      } else {
        const choices = choicesByOptionKey.get(segment.key) || new Set()
        return [...choices].sort().slice(0, maxChoices)
      }
    })

    const stepDocument: StepDocument = {
      suggestion,
      segments,
      expression,
    }

    return stepDocument
  })
}
