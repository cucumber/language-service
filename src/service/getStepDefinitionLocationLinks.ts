import { LocationLink, Position } from 'vscode-languageserver-types'

import { ExpressionLink } from '../language/types.js'
import { getStepRange } from './helpers.js'

export function getStepDefinitionLocationLinks(
  gherkinSource: string,
  position: Position,
  expressionLinks: readonly ExpressionLink[]
): LocationLink[] {
  const stepRange = getStepRange(gherkinSource, position)
  if (!stepRange) return []

  const locationLinks: LocationLink[] = []
  for (const expressionLink of expressionLinks) {
    if (expressionLink.expression.match(stepRange.stepText)) {
      const locationLink: LocationLink = {
        ...expressionLink.locationLink,
        originSelectionRange: stepRange.range,
      }
      locationLinks.push(locationLink)
    }
  }

  return locationLinks
}
