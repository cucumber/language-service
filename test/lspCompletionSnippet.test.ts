import assert from 'assert'

import { lspCompletionSnippet, StepSegments } from '../src/index.js'

describe('lspCompletionSnippet', () => {
  it('converts StepSegments to an LSP snippet', () => {
    const stepSegments: StepSegments = [
      'I have ',
      ['42', '54'],
      ' cukes in my ',
      ['basket', 'belly', 'table'],
    ]
    assert.strictEqual(
      lspCompletionSnippet(stepSegments),
      'I have ${1|42,54|} cukes in my ${2|basket,belly,table|}'
    )
  })
})
