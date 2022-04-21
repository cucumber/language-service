import {
  CucumberExpression,
  Node,
  NodeType,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'

import { ParameterChoices, StepDocument, StepSegments } from './types'

export function buildStepDocumentFromCucumberExpression(
  expression: CucumberExpression,
  registry: ParameterTypeRegistry,
  parameterChoices: ParameterChoices
): StepDocument {
  const compiledSegments = compile(expression.ast, registry, parameterChoices)
  const segments = flatten(compiledSegments)
  return {
    suggestion: expression.source,
    segments,
  }
}

type CompileResult = string | readonly CompileResult[]

function flatten(cr: CompileResult): StepSegments {
  if (typeof cr === 'string') return [cr]
  return cr.reduce<StepSegments>((prev, curr) => {
    const last = prev[prev.length - 1]
    if (typeof curr === 'string') {
      if (typeof last === 'string') {
        return prev.slice(0, prev.length - 1).concat([last + curr])
      } else {
        return prev.concat(curr)
      }
    } else {
      const x = curr.flatMap((e) => {
        if (typeof e === 'string') return e
        const e0 = e[0]
        if (!(typeof e0 === 'string')) throw new Error('Unexpected array: ' + JSON.stringify(e))
        return e0
      })
      return prev.concat([x])
    }
  }, [])
}

function compile(
  node: Node,
  registry: ParameterTypeRegistry,
  parameterChoices: ParameterChoices
): CompileResult {
  switch (node.type) {
    case NodeType.text:
      return node.text()
    case NodeType.optional:
      return compileOptional(node)
    case NodeType.alternation:
      return compileAlternation(node, registry, parameterChoices)
    case NodeType.alternative:
      return compileAlternative(node, registry, parameterChoices)
    case NodeType.parameter:
      return compileParameter(node, registry, parameterChoices)
    case NodeType.expression:
      return compileExpression(node, registry, parameterChoices)
    default:
      // Can't happen as long as the switch case is exhaustive
      throw new Error(node.type)
  }
}

function compileOptional(node: Node): CompileResult {
  if (node.nodes === undefined) throw new Error('No optional')
  return [node.nodes[0].text(), '']
}

function compileAlternation(
  node: Node,
  registry: ParameterTypeRegistry,
  parameterChoices: ParameterChoices
): CompileResult {
  return (node.nodes || []).map((node) => compile(node, registry, parameterChoices))
}

function compileAlternative(
  node: Node,
  registry: ParameterTypeRegistry,
  parameterChoices: ParameterChoices
): CompileResult {
  return (node.nodes || []).map((node) => compile(node, registry, parameterChoices))
}

function compileParameter(
  node: Node,
  registry: ParameterTypeRegistry,
  parameterChoices: ParameterChoices
): CompileResult {
  const parameterType = registry.lookupByTypeName(node.text())
  if (parameterType === undefined) throw new Error(`No parameter type named ${node.text()}`)
  const key = makeKey(parameterType)
  return parameterChoices[key] || defaultParameterChoices(parameterType) || ['']
}

function compileExpression(
  node: Node,
  registry: ParameterTypeRegistry,
  parameterChoices: ParameterChoices
): CompileResult {
  return (node.nodes || []).map((node) => compile(node, registry, parameterChoices))
}

function makeKey(parameterType: ParameterType<unknown>): string {
  return parameterType.name || parameterType.regexpStrings.join('|')
}

function defaultParameterChoices(parameterType: ParameterType<unknown>): readonly string[] {
  // @ts-ignore
  if (parameterType.type === Number) {
    return ['0']
  }
  return ['?']
}
