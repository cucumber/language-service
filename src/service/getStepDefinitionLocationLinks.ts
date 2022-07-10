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
      // the expressionLink.locationLink.targetUri value is not a valid Uri for Windows
      // It is treated as a directory. We assign a new URL instead. It is valid for Darwin/Linux/Windows
      expressionLink.locationLink.targetUri = new URL(expressionLink.locationLink.targetUri).href
      const locationLink: LocationLink = {
        ...expressionLink.locationLink,
        originSelectionRange: stepRange.range,
      }
      locationLinks.push(locationLink)
    }
  }

  return locationLinks
}
