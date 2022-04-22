import assert from 'assert'

import { lspCompletionSnippet } from '../../../src/service/snippet/lspCompletionSnippet.js'
import { SuggestionSegments } from '../../../src/suggestions/types.js'

describe('lspCompletionSnippet', () => {
  it('converts StepSegments to an LSP snippet', () => {
    const segments: SuggestionSegments = [
      'I have ',
      ['42', '54'],
      ' cukes in my ',
      ['basket', 'belly', 'table'],
    ]
    assert.strictEqual(
      lspCompletionSnippet(segments),
      'I have ${1|42,54|} cukes in my ${2|basket,belly,table|}'
    )
  })
})
