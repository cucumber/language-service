import {
  Expression,
  ExpressionFactory,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import { Envelope, StepDefinitionPatternType } from '@cucumber/messages'

import { extractStepTexts } from '../gherkin/extractStepTexts.js'
import { buildStepDocuments } from '../step-documents/buildStepDocuments.js'
import { StepDocument } from '../step-documents/types.js'

export type MessagesBuilderResult = {
  stepDocuments: readonly StepDocument[]
  expressions: readonly Expression[]
}

/**
 * Builds MessagesBuilderResult from Cucumber Messages.
 */
export class MessagesBuilder {
  private readonly parameterTypeRegistry = new ParameterTypeRegistry()
  private readonly expressionFactory = new ExpressionFactory(this.parameterTypeRegistry)

  private readonly expressions: Expression[] = []
  private stepTexts: readonly string[] = []

  processEnvelope(envelope: Envelope, errorHandler: (err: Error) => void = () => undefined): void {
    if (envelope.parameterType) {
      const { name, regularExpressions, useForSnippets, preferForRegularExpressionMatch } =
        envelope.parameterType
      try {
        // TODO: Check if the type exists before registering. Because Cucumber-JVM emits them several times
        this.parameterTypeRegistry.defineParameterType(
          new ParameterType(
            name,
            regularExpressions,
            Object,
            () => undefined,
            useForSnippets,
            preferForRegularExpressionMatch
          )
        )
      } catch (err) {
        errorHandler(err)
      }
    }
    if (envelope.stepDefinition) {
      // TODO: Register Cucumber-JVM parameter types if they haven't already been defined
      const expr =
        envelope.stepDefinition.pattern.type === StepDefinitionPatternType.CUCUMBER_EXPRESSION
          ? envelope.stepDefinition.pattern.source
          : new RegExp(envelope.stepDefinition.pattern.source)
      try {
        const expression = this.expressionFactory.createExpression(expr)
        this.expressions.push(expression)
      } catch (err) {
        errorHandler(err)
      }
    }
    if (envelope.gherkinDocument) {
      this.stepTexts = extractStepTexts(envelope.gherkinDocument, this.stepTexts)
    }
  }

  build(): MessagesBuilderResult {
    return {
      stepDocuments: buildStepDocuments(
        this.parameterTypeRegistry,
        this.stepTexts,
        this.expressions
      ),
      expressions: this.expressions,
    }
  }
}
