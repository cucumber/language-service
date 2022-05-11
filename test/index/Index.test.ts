import assert from 'assert'
import * as txtgen from 'txtgen'

import { bruteForceIndex, fuseIndex, Index, jsSearchIndex } from '../../src/index/index.js'
import { Suggestion } from '../../src/suggestions/types.js'

type BuildIndex = (suggestions: readonly Suggestion[]) => Index

function verifyIndexContract(name: string, buildIndex: BuildIndex) {
  describe(name, () => {
    describe('basics', () => {
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

      const s3: Suggestion = {
        label: '{word} can do it',
        segments: [['You', 'They'], 'can do it'],
        matched: true,
      }
      let index: Index
      beforeEach(() => {
        index = buildIndex([s1, s2, s3])
      })

      it('matches two words in the beginning of an expression', () => {
        const suggestions = index('have')
        assert.deepStrictEqual(suggestions, [s1])
      })

      it('matches a word in an expression', () => {
        const suggestions = index('cukes')
        assert.deepStrictEqual(suggestions, [s1])
      })

      it('matches a word in a choice', () => {
        const suggestions = index('98')
        assert.deepStrictEqual(suggestions, [s1])
      })

      it('matches another word in a choice', () => {
        const suggestions = index('They')
        assert.deepStrictEqual(suggestions, [s3])
      })

      it('matches nothing', () => {
        const suggestions = index('nope')
        assert.deepStrictEqual(suggestions, [])
      })
    })

    if (!process.env.CI) {
      describe('performance / fuzz', () => {
        it('matches how quickly exactly?', () => {
          for (let i = 0; i < 100; i++) {
            const length = 100
            const allSuggestions: Suggestion[] = Array(length)
              .fill(0)
              .map(() => {
                const sentence = txtgen.sentence()
                return {
                  label: sentence,
                  segments: [sentence],
                  matched: false,
                }
              })
            const index = buildIndex(allSuggestions)

            const sentence = allSuggestions[Math.floor(length / 2)].segments[0] as string
            const words = sentence.split(' ')
            // Find a word longer than 5 letters (fall back to the middle word if there are none)
            const word =
              words.find((word) => word.length > 5) || words[Math.floor(words.length / 2)]
            const term = word.replace(/[.?!;,']/g, '').toLowerCase()

            const suggestions = index(term)
            if (suggestions.length === 0) {
              console.error(`WARNING: ${name} - no hits for "${term}"`)
            }
            for (const suggestion of suggestions) {
              const s = (suggestion.segments[0] as string).toLowerCase()
              if (!s.includes(term)) {
                console.error(`WARNING: ${name} - "${s}" does not include "${term}"`)
              }
            }
          }
        })
      })
    }
  })
}

verifyIndexContract('bruteForceIndex', bruteForceIndex)
verifyIndexContract('fuseIndex', fuseIndex)
verifyIndexContract('jsSearchIndex', jsSearchIndex)
