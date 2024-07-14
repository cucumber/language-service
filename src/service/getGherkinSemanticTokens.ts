import { Expression } from '@cucumber/cucumber-expressions'
import { walkGherkinDocument } from '@cucumber/gherkin-utils'
import * as messages from '@cucumber/messages'
import { SemanticTokens, SemanticTokenTypes } from 'vscode-languageserver-types'

import { parseGherkinDocument } from '../gherkin/parseGherkinDocument.js'

// The default vs theme can only highlight certain tokens. See the list of those tokens in
// https://microsoft.github.io/monaco-editor/monarch.html
export const semanticTokenTypes: SemanticTokenTypes[] = [
  SemanticTokenTypes.keyword, // Feature, Scenario, Given etc
  SemanticTokenTypes.parameter, // step parameters
  SemanticTokenTypes.string, // DocString content and ``` delimiter, table cells (except example table header rows)
  SemanticTokenTypes.type, // @tags and DocString ```type
  SemanticTokenTypes.variable, // step <placeholder>
  SemanticTokenTypes.property, // examples table header row
]

const indexByType = Object.fromEntries(semanticTokenTypes.map((type, index) => [type, index]))

// https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#textDocument_semanticTokens
export function getGherkinSemanticTokens(
  gherkinSource: string,
  expressions: readonly Expression[]
): SemanticTokens {
  const { gherkinDocument } = parseGherkinDocument(gherkinSource)
  if (!gherkinDocument) {
    return {
      data: [],
    }
  }
  const lines = gherkinSource.split(/\r?\n/)
  let lastLineNumber = 0
  let lastCharacter = 0

  function makeLocationToken(
    location: messages.Location,
    token: string,
    type: SemanticTokenTypes,
    data: readonly number[]
  ) {
    const lineNumber = location.line - 1
    if (location.column === undefined)
      throw new Error(`Incomplete location: ${JSON.stringify(location)}`)
    const character = location.column - 1
    return makeToken(lineNumber, character, token, type, data)
  }

  function makeToken(
    lineNumber: number,
    character: number,
    token: string,
    type: SemanticTokenTypes,
    data: readonly number[]
  ) {
    const charDelta = lineNumber === lastLineNumber ? character - lastCharacter : character
    lastCharacter = character
    const lineOffset = lineNumber - lastLineNumber
    lastLineNumber = lineNumber
    const length = token.length
    const typeIndex = indexByType[type]
    return data.concat([lineOffset, charDelta, length, typeIndex, 0])
  }

  let inScenarioOutline = false
  let inExamples = false

  const data = walkGherkinDocument<number[]>(gherkinDocument, [], {
    tag(tag, arr) {
      return makeLocationToken(tag.location, tag.name, SemanticTokenTypes.type, arr)
    },
    feature(feature, arr) {
      return makeLocationToken(feature.location, feature.keyword, SemanticTokenTypes.keyword, arr)
    },
    rule(rule, arr) {
      return makeLocationToken(rule.location, rule.keyword, SemanticTokenTypes.keyword, arr)
    },
    background(background, arr) {
      return makeLocationToken(
        background.location,
        background.keyword,
        SemanticTokenTypes.keyword,
        arr
      )
    },
    scenario(scenario, arr) {
      inScenarioOutline = (scenario.examples || []).length > 0
      return makeLocationToken(scenario.location, scenario.keyword, SemanticTokenTypes.keyword, arr)
    },
    examples(examples, arr) {
      inExamples = true
      return makeLocationToken(examples.location, examples.keyword, SemanticTokenTypes.keyword, arr)
    },
    step(step, arr) {
      if (step.location.column === undefined)
        throw new Error(`Incomplete location: ${JSON.stringify(step.location)}`)

      inExamples = false
      arr = makeLocationToken(step.location, step.keyword, SemanticTokenTypes.keyword, arr)
      if (inScenarioOutline) {
        const regexp = /(<[^>]+>)/g
        const line = step.location.line - 1
        const startOfText = lines[line].indexOf(step.text)

        let match: RegExpExecArray | null
        while ((match = regexp.exec(step.text)) !== null) {
          const character = startOfText + match.index
          arr = makeToken(line, character, match[0], SemanticTokenTypes.variable, arr)
        }
      } else {
        for (const expression of expressions) {
          const args = expression.match(step.text)
          if (args) {
            for (const arg of args) {
              if (arg.group.start) {
                const character = step.location.column - 1 + step.keyword.length + arg.group.start
                arr = makeToken(
                  step.location.line - 1,
                  character,
                  arg.group.value,
                  SemanticTokenTypes.parameter,
                  arr
                )
              }
            }
            break
          }
        }
      }
      return arr
    },
    docString(docString, arr) {
      arr = makeLocationToken(
        docString.location,
        docString.delimiter,
        SemanticTokenTypes.string,
        arr
      )
      if (docString.mediaType) {
        if (docString.location.column === undefined)
          throw new Error(`Incomplete location: ${JSON.stringify(docString.location)}`)

        const character = docString.location.column - 1 + docString.delimiter.length
        arr = makeToken(
          docString.location.line - 1,
          character,
          docString.mediaType,
          SemanticTokenTypes.type,
          arr
        )
      }
      const maxLineNumber = docString.location.line + docString.content.split(/\r?\n/).length
      for (let lineNumber = docString.location.line; lineNumber <= maxLineNumber; lineNumber++) {
        const spaceContent = /^(\s*)(.*)$/.exec(lines[lineNumber])
        if (spaceContent === null) throw new Error(`No match for ${lines[lineNumber]}`)
        const startChar = spaceContent[1].length
        const token = spaceContent[2]
        arr = makeToken(lineNumber, startChar, token, SemanticTokenTypes.string, arr)
      }
      return arr
    },
    tableRow(tableRow, arr) {
      const type = inExamples ? SemanticTokenTypes.property : SemanticTokenTypes.string
      for (const cell of tableRow.cells) {
        arr = makeLocationToken(cell.location, cell.value, type, arr)
      }
      inExamples = false
      return arr
    },
  })

  return {
    data,
  }
}
