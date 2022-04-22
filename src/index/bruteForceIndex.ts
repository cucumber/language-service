import { Suggestion } from '../suggestions/types.js'
import { Index } from './types'

/**
 * A brute force (not very performant or fuzzy-search capable) index that matches permutation expressions with string.includes()
 *
 * @param suggestions
 */
export function bruteForceIndex(suggestions: readonly Suggestion[]): Index {
  return (text) => {
    if (!text) return []
    const predicate = (segment: string) => segment.toLowerCase().includes(text.toLowerCase())
    return suggestions.filter((permutationExpression) => matches(permutationExpression, predicate))
  }
}

function matches(suggestion: Suggestion, predicate: (segment: string) => boolean): boolean {
  return !!suggestion.segments.find((segment) =>
    typeof segment === 'string' ? predicate(segment) : !!segment.find(predicate)
  )
}
