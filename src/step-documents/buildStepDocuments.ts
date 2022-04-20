import {
  AbstractCompiler,
  CucumberExpression,
  Expression,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'

import { StepDocument } from './types.js'

type TextOrParameterTypeNameExpression = TextOrParameterTypeNameSegment[]
type TextOrParameterTypeNameSegment = string | ParameterTypeData
type ParameterTypeData = { name: string; regexpStrings: string }

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
  const choicesByParameterTypeRegexpStrings = new Map<string, Set<string>>()
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
          const regexpStrings = parameterType.regexpStrings.join('|')
          textOrParameterTypeNameExpression.push({ name: parameterType.name || '', regexpStrings })
          let choices = choicesByParameterTypeRegexpStrings.get(regexpStrings)
          if (!choices) {
            choices = new Set<string>()
            choicesByParameterTypeRegexpStrings.set(regexpStrings, choices)
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
              return `{${segment.name}}`
            }
          })
          .join('')
        suggestionByJson.set(json, suggestion)
        jsonTextOrParameterTypeNameExpression.add(json)
      }
    }
    if (!matched && expression instanceof CucumberExpression) {
      const compiler = new SegmentCompiler(expression.source, parameterTypeRegistry)
      const textOrParameterTypeNameExpression = compiler.compile(expression.ast)
      const json = JSON.stringify(textOrParameterTypeNameExpression)
      expressionByJson.set(json, expression)
      suggestionByJson.set(json, expression.source)
      jsonTextOrParameterTypeNameExpression.add(json)
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
        const choices = choicesByParameterTypeRegexpStrings.get(segment.regexpStrings) || new Set()
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

class SegmentCompiler extends AbstractCompiler<TextOrParameterTypeNameExpression> {
  protected produceText(expression: string) {
    return [expression]
  }

  protected produceOptional(
    segments: TextOrParameterTypeNameExpression[]
  ): TextOrParameterTypeNameExpression {
    throw new Error('Method not implemented.')
  }

  protected produceAlternative(
    segments: TextOrParameterTypeNameExpression[]
  ): TextOrParameterTypeNameExpression {
    throw new Error('Method not implemented.')
  }

  protected produceAlternation(
    segments: TextOrParameterTypeNameExpression[]
  ): TextOrParameterTypeNameExpression {
    throw new Error('Method not implemented.')
  }

  protected produceParameter(
    parameterType: ParameterType<unknown>
  ): TextOrParameterTypeNameExpression {
    const name = parameterType.name || '?'
    const regexpStrings = parameterType.regexpStrings.join('|')
    const parameterTypeData: ParameterTypeData = { name, regexpStrings }
    return [parameterTypeData]
  }

  protected produceExpression(
    segments: TextOrParameterTypeNameExpression[]
  ): TextOrParameterTypeNameExpression {
    return segments.reduce((prev, curr) => {
      const last = prev[prev.length - 1]
      if (typeof last === 'string' && typeof curr[0] === 'string') {
        return prev.slice(0, prev.length - 1).concat([last + curr[0]])
      } else {
        return prev.concat(curr)
      }
    }, [])
  }
}
