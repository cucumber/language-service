import { Search } from 'js-search'

import { Suggestion } from '../suggestions/types.js'
import { Index } from './types.js'

type Doc = {
  id: number
  text: string
}

export function jsSearchIndex(suggestions: readonly Suggestion[]): Index {
  const docs: Doc[] = suggestions.map((suggestion, id) => {
    return {
      id,
      text: suggestion.segments
        .map((segment) => (typeof segment === 'string' ? segment : segment.join(' ')))
        .join(''),
    }
  })

  const search = new Search('id')
  search.addIndex('text')
  search.addDocuments(docs)

  return (text) => {
    if (!text) return []
    const results = search.search(text)
    return results.map((result: Doc) => suggestions[result.id])
  }
}
