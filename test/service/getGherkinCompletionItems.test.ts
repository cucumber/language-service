import assert from 'assert'
import { CompletionItem, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver-types'

import { bruteForceIndex } from '../../src/index/index.js'
import { getGherkinCompletionItems } from '../../src/service/getGherkinCompletionItems.js'
import { Suggestion } from '../../src/suggestions/types.js'

describe('getGherkinCompletionItems', () => {
  it('completes matched step', () => {
    const s1: Suggestion = {
      label: 'I have {int} cukes in my belly',
      segments: ['I have ', ['42', '98'], ' cukes in my belly'],
      matched: true,
    }
    const s2: Suggestion = {
      label: 'I am a teapot',
      segments: ['I am a teapot'],
      matched: true,
    }

    const index = bruteForceIndex([s1, s2])
    const gherkinSource = `Feature: Hello
  Scenario: World
    Given cukes
`
    const completions = getGherkinCompletionItems(gherkinSource, 2, index)
    const expectedCompletions: CompletionItem[] = [
      {
        label: 'I have {int} cukes in my belly',
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Text,
        labelDetails: {},
        textEdit: {
          newText: 'I have ${1|42,98|} cukes in my belly',
          range: {
            start: {
              line: 2,
              character: 10,
            },
            end: {
              line: 2,
              character: 15,
            },
          },
        },
      },
    ]
    assert.deepStrictEqual(completions, expectedCompletions)
  })

  it('completes unmatched step', () => {
    const s1: Suggestion = {
      label: 'I have {int} cukes in my belly',
      segments: ['I have ', ['42', '98'], ' cukes in my belly'],
      matched: true,
    }
    const s2: Suggestion = {
      label: 'I am a teapot',
      segments: ['I am a teapot'],
      matched: false,
    }

    const index = bruteForceIndex([s1, s2])
    const gherkinSource = `Feature: Hello
  Scenario: World
    Given teapot
`
    const completions = getGherkinCompletionItems(gherkinSource, 2, index)
    const expectedCompletions: CompletionItem[] = [
      {
        label: 'I am a teapot',
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Text,
        labelDetails: {
          detail: ' (undefined step)',
        },
        textEdit: {
          newText: 'I am a teapot',
          range: {
            start: {
              line: 2,
              character: 10,
            },
            end: {
              line: 2,
              character: 16,
            },
          },
        },
      },
    ]
    assert.deepStrictEqual(completions, expectedCompletions)
  })
})
