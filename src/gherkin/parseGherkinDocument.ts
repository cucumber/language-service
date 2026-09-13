import {
  AstBuilder,
  Errors,
  GherkinClassicTokenMatcher,
  GherkinInMarkdownTokenMatcher,
  Parser,
} from '@cucumber/gherkin'
import { GherkinDocument, IdGenerator } from '@cucumber/messages'

import { isMarkdownFeatureUri } from './isMarkdownFeatureUri.js'

const uuidFn = IdGenerator.uuid()

export type ParseResult = {
  gherkinDocument?: GherkinDocument
  error?: Errors.GherkinException
}

/**
 * Incrementally parses a Gherkin Document, allowing some syntax errors to occur.
 *
 * When `uri` ends with `.feature.md`, the document is parsed as Gherkin-in-Markdown;
 * otherwise (including when `uri` is omitted) classic Gherkin is used.
 */
export function parseGherkinDocument(gherkinSource: string, uri?: string): ParseResult {
  const builder = new AstBuilder(uuidFn)
  const matcher = isMarkdownFeatureUri(uri)
    ? new GherkinInMarkdownTokenMatcher()
    : new GherkinClassicTokenMatcher()
  const parser = new Parser(builder, matcher)
  try {
    return {
      gherkinDocument: parser.parse(gherkinSource),
    }
  } catch (error) {
    let gherkinDocument: GherkinDocument

    for (let i = 0; i < 10; i++) {
      gherkinDocument = builder.getResult()
      if (gherkinDocument) {
        return {
          gherkinDocument,
          error,
        }
      }

      try {
        builder.endRule()
      } catch (ignore) {
        // no-op
      }
    }

    return {
      error,
    }
  }
}
