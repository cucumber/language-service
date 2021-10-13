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
 * Builds CucumberInfo from Cucumber Messages.
 */
export class MessagesBuilder {
  private readonly parameterTypeRegistry = new ParameterTypeRegistry()
  private readonly expressionFactory = new ExpressionFactory(this.parameterTypeRegistry)

  private readonly expressions: Expression[] = []
  private stepTexts: readonly string[] = []

  processEnvelope(envelope: Envelope): void {
    if (envelope.parameterType) {
      const { name, regularExpressions, useForSnippets, preferForRegularExpressionMatch } =
        envelope.parameterType
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
    }
    if (envelope.stepDefinition) {
      const expr =
        envelope.stepDefinition.pattern.type === StepDefinitionPatternType.CUCUMBER_EXPRESSION
          ? envelope.stepDefinition.pattern.source
          : new RegExp(envelope.stepDefinition.pattern.source)
      const expression = this.expressionFactory.createExpression(expr)
      this.expressions.push(expression)
    }
    if (envelope.gherkinDocument) {
      this.stepTexts = extractStepTexts(envelope.gherkinDocument, this.stepTexts)
    }
  }

  build(): MessagesBuilderResult {
    return {
      stepDocuments: buildStepDocuments(this.stepTexts, this.expressions),
      expressions: this.expressions,
    }
  }
}
