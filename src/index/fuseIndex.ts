import Fuse from 'fuse.js'

import { Suggestion } from '../suggestions/types.js'
import { Index } from './types.js'

type Doc = {
  text: string
}

export function fuseIndex(suggestions: readonly Suggestion[]): Index {
  const docs: Doc[] = suggestions.map((suggestion) => {
    return {
      text: suggestion.segments
        .map((segment) => (typeof segment === 'string' ? segment : segment.join(' ')))
        .join(''),
    }
  })
  const fuse = new Fuse(docs, {
    keys: ['text'],
    minMatchCharLength: 2,
    threshold: 0.1,
    ignoreLocation: true,
    fieldNormWeight: 1,
  })

  return (text) => {
    if (!text) return []
    const results = fuse.search(text, { limit: 10 })
    return results.map((result) => suggestions[result.refIndex])
  }
}
