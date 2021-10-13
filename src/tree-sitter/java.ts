import {
  Expression,
  ExpressionFactory,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import Parser from 'web-tree-sitter'

export function buildExpressions(
  parser: Parser,
  Java: Parser.Language,
  sources: string[]
): readonly Expression[] {
  let matches: Parser.QueryMatch[] = []
  for (const source of sources) {
    matches = matches.concat(queryMethodAnnotations(parser, Java, source))
  }
  const parameterTypeRegistry = new ParameterTypeRegistry()

  for (const match of matches) {
    const parameterType = buildParameterType(match)
    if (parameterType) {
      parameterTypeRegistry.defineParameterType(parameterType)
    }
  }

  const expressions: Expression[] = []
  const expressionFactory = new ExpressionFactory(parameterTypeRegistry)
  for (const match of matches) {
    const expression = buildExpression(match, expressionFactory)
    if (expression) {
      expressions.push(expression)
    }
  }
  return expressions
}

function queryMethodAnnotations(
  parser: Parser,
  Java: Parser.Language,
  source: string
): readonly Parser.QueryMatch[] {
  parser.setLanguage(Java)
  const tree = parser.parse(source)
  // See https://github.com/tree-sitter/tree-sitter/issues/1392
  const methodAnnotationQuery = Java.query(`
(method_declaration 
  (modifiers 
    (annotation 
      name: [(identifier) (scoped_identifier)] @annotation-name 
      arguments: (annotation_argument_list
        (string_literal)? @literal-value
      )
    )
  )
  name: (identifier) @method-name
)
  `)
  return methodAnnotationQuery.matches(tree.rootNode)
}

function buildParameterType(match: Parser.QueryMatch): ParameterType<unknown> | null {
  const annotationCapture = match.captures.find((c) => c.name === 'annotation-name')
  if (!annotationCapture) return null
  const annotationNameNode = annotationCapture.node
  const annotationName = annotationNameNode.text
  if (!isParameterType(annotationName)) return null

  const methodNameCapture = match.captures.find((c) => c.name === 'method-name')
  if (!methodNameCapture) return null
  let name = methodNameCapture.node.text
  let quotedRegexp: string | undefined
  const literalValue = match.captures.find((c) => c.name === 'literal-value')
  if (literalValue) {
    quotedRegexp = literalValue.node.text
  } else {
    const annotationNode = annotationNameNode.parent
    if (!annotationNode) return null
    const pairs = annotationNode.descendantsOfType('element_value_pair')
    for (const pair of pairs) {
      const key = pair.childForFieldName('key')
      const value = pair.childForFieldName('value')
      if (key && key.text === 'name' && value) {
        name = value.text.substring(1, value.text.length - 1)
      }
      if (key && key.text === 'value' && value) {
        quotedRegexp = value.text
      }
    }
  }
  if (!quotedRegexp) return null
  const regexps = quotedRegexp.substring(1, quotedRegexp.length - 1)
  return new ParameterType(name, regexps, Object, () => undefined, false, false)
}

function buildExpression(
  match: Parser.QueryMatch,
  expressionFactory: ExpressionFactory
): Expression | null {
  const annotationNameCapture = match.captures.find((c) => c.name === 'annotation-name')
  if (!annotationNameCapture) return null
  const annotationNameNode = annotationNameCapture.node
  const annotationName = annotationNameNode.text
  if (!isStep(annotationName)) return null

  const literalCapture = match.captures.find((c) => c.name === 'literal-value')
  if (!literalCapture) return null
  const literalValue = literalCapture.node.text
  return expressionFactory.createExpression(literalValue.substring(1, literalValue.length - 1))
}

function isParameterType(annotation: string) {
  return ['ParameterType', 'io.cucumber.java.ParameterType'].includes(annotation)
}

function isStep(annotation: string) {
  return ['Given', 'When', 'Then'].includes(annotation)
}
