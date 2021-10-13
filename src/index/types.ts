/**
 * A search index function.
 *
 * @param text a text to search for
 * @return results in the form of step documents
 */
import { StepDocument } from '../step-documents/types.js'

export type Index = (text: string) => readonly StepDocument[]
