import { CucumberExpression, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { LocationLink, Range } from 'vscode-languageserver-types'

import { ExpressionLink } from '../../src/language/types.js'
import { getStepDefinitionLocationLinks } from '../../src/service/getStepDefinitionLocationLinks.js'

describe('getStepDefinitionLocationLinks', () => {
  it('finds a matched step definition', () => {
    const expression = new CucumberExpression('some cukes/apples', new ParameterTypeRegistry())
    const gherkinSource = `Feature: Hello
      Scenario: World
        Given some cukes
    `

    const targetUri = 'file://path/to/some/file.ts'
    // The range of the Cucumber/Regular Expression
    const targetRange: Range = Range.create(10, 10, 10, 27)
    const expressionLinks: ExpressionLink[] = [
      {
        expression,
        partialLink: {
          targetUri,
          targetRange,
          targetSelectionRange: targetRange,
        },
      },
    ]
    // The cursor is between the c and the u
    const links = getStepDefinitionLocationLinks(
      gherkinSource,
      { line: 2, character: 20 },
      expressionLinks
    )

    // The range of the Gherkin step text
    const originSelectionRange = {
      start: {
        line: 2,
        character: 14,
      },
      end: {
        line: 2,
        character: 24,
      },
    }

    const expectedLinks: LocationLink[] = [
      {
        originSelectionRange,
        targetRange: targetRange,
        targetSelectionRange: targetRange,
        targetUri,
      },
    ]

    assert.deepStrictEqual(links, expectedLinks)
  })
})
