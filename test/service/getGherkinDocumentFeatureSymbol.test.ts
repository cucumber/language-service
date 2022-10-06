import assert from 'assert'

import { getGherkinDocumentFeatureSymbol } from '../../src/service/getGherkinDocumentFeatureSymbol.js'

describe('getGherkinDocumentFeatureSymbol', () => {
  it('creates document symbols for keywords', () => {
    const gherkinSource = `
    Feature: f
      Background: fb
      Scenario: s1
      Scenario: s2
      Rule: r
        Background: rb
        Scenario: rs1
        Scenario: rs2
    `
    const symbol = getGherkinDocumentFeatureSymbol(gherkinSource)
    // Remove the properties we're not interested in
    const json = JSON.stringify(
      symbol,
      (key, value) => (['range', 'selectionRange', 'kind'].includes(key) ? undefined : value),
      2
    )
    const smallerSymbol = JSON.parse(json)

    assert.deepStrictEqual(smallerSymbol, {
      name: 'Feature: f',
      children: [
        {
          name: 'Background: fb',
          children: [],
        },
        {
          name: 'Scenario: s1',
          children: [],
        },
        {
          name: 'Scenario: s2',
          children: [],
        },
        {
          name: 'Rule: r',
          children: [
            {
              name: 'Background: rb',
              children: [],
            },
            {
              name: 'Scenario: rs1',
              children: [],
            },
            {
              name: 'Scenario: rs2',
              children: [],
            },
          ],
        },
      ],
    })
  })
})
