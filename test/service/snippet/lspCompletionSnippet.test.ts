import assert from 'assert'

import { lspCompletionSnippet } from '../../../src/service/snippet/lspCompletionSnippet.js'
import { StepSegments } from '../../../src/step-documents/types.js'

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
