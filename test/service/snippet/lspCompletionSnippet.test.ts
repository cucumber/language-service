import assert from 'assert'

import { StepSegments } from '../../../src/index/step-documents/types.js'
import { lspCompletionSnippet } from '../../../src/service/snippet/lspCompletionSnippet.js'

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
