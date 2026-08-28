import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import type { GherkinDocument } from '@cucumber/messages'

export function extractStepTexts(
  gherkinDocument: GherkinDocument,
  stepTexts: readonly string[]
): readonly string[] {
  return walkGherkinDocument(gherkinDocument, stepTexts, {
    step(step, arr) {
      return arr.concat(step.text)
    },
  })
}
