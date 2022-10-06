import assert from 'assert'
import { DocumentSymbol } from 'vscode-languageserver-types'

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

    const expected: DocumentSymbol = {
      name: 'Feature: f',
      range: {
        start: {
          line: 1,
          character: 13,
        },
        end: {
          line: 1,
          character: 14,
        },
      },
      selectionRange: {
        start: {
          line: 1,
          character: 13,
        },
        end: {
          line: 1,
          character: 14,
        },
      },
      kind: 12,
      children: [
        {
          name: 'Background: fb',
          range: {
            start: {
              line: 2,
              character: 18,
            },
            end: {
              line: 2,
              character: 20,
            },
          },
          selectionRange: {
            start: {
              line: 2,
              character: 18,
            },
            end: {
              line: 2,
              character: 20,
            },
          },
          kind: 12,
          children: [],
        },
        {
          name: 'Scenario: s1',
          range: {
            start: {
              line: 3,
              character: 16,
            },
            end: {
              line: 3,
              character: 18,
            },
          },
          selectionRange: {
            start: {
              line: 3,
              character: 16,
            },
            end: {
              line: 3,
              character: 18,
            },
          },
          kind: 12,
          children: [],
        },
        {
          name: 'Scenario: s2',
          range: {
            start: {
              line: 4,
              character: 16,
            },
            end: {
              line: 4,
              character: 18,
            },
          },
          selectionRange: {
            start: {
              line: 4,
              character: 16,
            },
            end: {
              line: 4,
              character: 18,
            },
          },
          kind: 12,
          children: [],
        },
        {
          name: 'Rule: r',
          range: {
            start: {
              line: 5,
              character: 12,
            },
            end: {
              line: 5,
              character: 13,
            },
          },
          selectionRange: {
            start: {
              line: 5,
              character: 12,
            },
            end: {
              line: 5,
              character: 13,
            },
          },
          kind: 12,
          children: [
            {
              name: 'Background: rb',
              range: {
                start: {
                  line: 6,
                  character: 20,
                },
                end: {
                  line: 6,
                  character: 22,
                },
              },
              selectionRange: {
                start: {
                  line: 6,
                  character: 20,
                },
                end: {
                  line: 6,
                  character: 22,
                },
              },
              kind: 12,
              children: [],
            },
            {
              name: 'Scenario: rs1',
              range: {
                start: {
                  line: 7,
                  character: 18,
                },
                end: {
                  line: 7,
                  character: 21,
                },
              },
              selectionRange: {
                start: {
                  line: 7,
                  character: 18,
                },
                end: {
                  line: 7,
                  character: 21,
                },
              },
              kind: 12,
              children: [],
            },
            {
              name: 'Scenario: rs2',
              range: {
                start: {
                  line: 8,
                  character: 18,
                },
                end: {
                  line: 8,
                  character: 21,
                },
              },
              selectionRange: {
                start: {
                  line: 8,
                  character: 18,
                },
                end: {
                  line: 8,
                  character: 21,
                },
              },
              kind: 12,
              children: [],
            },
          ],
        },
      ],
    }

    assert.deepStrictEqual(symbol, expected)
  })
})
