/**
 * A search index function.
 *
 * @param text a text to search for
 * @return results in the form of suggestions
 */
import { Suggestion } from '../suggestions/types.js'

export type Index = (text: string) => readonly Suggestion[]
