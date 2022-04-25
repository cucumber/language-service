import assert from 'assert'

import { lspCompletionSnippet } from '../../../src/service/snippet/lspCompletionSnippet.js'
import { SuggestionSegments } from '../../../src/suggestions/types.js'

describe('lspCompletionSnippet', () => {
  it('converts segments to an LSP snippet', () => {
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

  it('removes empty suggestions', () => {
    const segments: SuggestionSegments = ['I have cuke', ['s', '']]
    assert.strictEqual(lspCompletionSnippet(segments), 'I have cuke${1|s|}')
  })

  it('escapes special characters', () => {
    const segments: SuggestionSegments = ['the choices are ', ['', '$', '\\', '}', ',', '|']]
    assert.strictEqual(lspCompletionSnippet(segments), 'the choices are ${1|\\$,\\\\,\\},\\,,\\||}')
  })
})
