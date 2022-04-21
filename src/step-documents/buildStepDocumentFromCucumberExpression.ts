import {
  CucumberExpression,
  Node,
  NodeType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'

import { StepDocument, StepSegments } from './types'

export function buildStepDocumentFromCucumberExpression(
  expression: CucumberExpression,
  registry: ParameterTypeRegistry
): StepDocument {
  // @ts-ignore
  const ast: Node = expression.ast
  const compiledSegments = compile(ast, registry)
  const segments = flatten(compiledSegments)
  return {
    suggestion: expression.source,
    segments,
  }
}

type CompileResult = string | CompileResult[]

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
        if (Array.isArray(e0)) throw new Error('Unexpected array: ' + JSON.stringify(e))
        return e0
      })
      return prev.concat([x])
    }
  }, [])
}

function compile(node: Node, registry: ParameterTypeRegistry): CompileResult {
  switch (node.type) {
    case NodeType.text:
      return node.text()
    case NodeType.optional:
      return compileOptional(node, registry)
    case NodeType.alternation:
      return compileAlternation(node, registry)
    case NodeType.alternative:
      return compileAlternative(node, registry)
    case NodeType.parameter:
      return compileParameter(node, registry)
    case NodeType.expression:
      return compileExpression(node, registry)
    default:
      // Can't happen as long as the switch case is exhaustive
      throw new Error(node.type)
  }
}

function compileOptional(node: Node, registry: ParameterTypeRegistry): CompileResult {
  if (node.nodes === undefined) throw new Error('No optional')
  return [node.nodes[0].text(), '']
}

function compileAlternation(node: Node, registry: ParameterTypeRegistry): CompileResult {
  return (node.nodes || []).map((node) => compile(node, registry))
}

function compileAlternative(node: Node, registry: ParameterTypeRegistry): CompileResult {
  return (node.nodes || []).map((node) => compile(node, registry))
}

function compileParameter(node: Node, registry: ParameterTypeRegistry): CompileResult {
  const parameterType = registry.lookupByTypeName(node.text())
  throw new Error('Method not implemented.')
}

function compileExpression(node: Node, registry: ParameterTypeRegistry): CompileResult {
  return (node.nodes || []).map((node) => compile(node, registry))
}
