// import assert from 'assert'
// import { CompletionItem, CompletionItemKind, InsertTextFormat } from 'vscode-languageserver-types'

// import { bruteForceIndex } from '../../src/index/index.js'
import { getStepDefinitionLocationLinks } from '../../src/service/getStepDefinitionLocationLinks.js'
// import { Suggestion } from '../../src/suggestions/types.js'

describe('getStepDefinitionLocationLinks', () => {
  it('find a matched step definition', () => {
    const gherkinSource = `Feature: Hello
      Scenario: World
        Given cukes
    `

    const links = getStepDefinitionLocationLinks(gherkinSource, { line: 2, character: 15 })

    console.log(links)

    //     const s1: Suggestion = {
    //       label: 'I have {int} cukes in my belly',
    //       segments: ['I have ', ['42', '98'], ' cukes in my belly'],
    //       matched: true,
    //     }
    //     const s2: Suggestion = {
    //       label: 'I am a teapot',
    //       segments: ['I am a teapot'],
    //       matched: true,
    //     }
    //     const index = bruteForceIndex([s1, s2])
    //     const gherkinSource = `Feature: Hello
    //   Scenario: World
    //     Given cukes
    // `
    //     const completions = getGherkinLocationLinks(gherkinSource, { line: 2, character: 15 }, index)
    //     const expectedCompletions: CompletionItem[] = [
    //       {
    //         label: 'I have {int} cukes in my belly',
    //         insertTextFormat: InsertTextFormat.Snippet,
    //         kind: CompletionItemKind.Text,
    //         labelDetails: {},
    //         filterText: 'cukes',
    //         sortText: '1000',
    //         textEdit: {
    //           newText: 'I have ${1|42,98|} cukes in my belly',
    //           range: {
    //             start: {
    //               line: 2,
    //               character: 10,
    //             },
    //             end: {
    //               line: 2,
    //               character: 15,
    //             },
    //           },
    //         },
    //       },
    //     ]
    //     assert.deepStrictEqual(completions, expectedCompletions)
  })
})
