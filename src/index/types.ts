import { StepDocument } from '../types.js'

/**
 * A search index function.
 *
 * @param text a text to search for
 * @return results in the form of step documents
 */
export type Index = (text: string) => readonly StepDocument[]
