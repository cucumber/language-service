import {
  Expression,
  ExpressionFactory,
  ParameterType,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions'
import { Envelope, StepDefinitionPatternType } from '@cucumber/messages'

import { extractStepTexts } from '../gherkin/extractStepTexts.js'
import { buildSuggestions, sortedSuggestions } from '../suggestions/buildSuggestions.js'
import { Suggestion } from '../suggestions/types.js'

export type MessagesBuilderResult = {
  suggestions: readonly Suggestion[]
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
      suggestions: sortedSuggestions(
        buildSuggestions(
          this.parameterTypeRegistry,
          new Set(this.stepTexts),
          this.expressions,
          new Map(),
          false
        )
      ),
      expressions: this.expressions,
    }
  }
}
