import { NdjsonToMessageStream } from '@cucumber/message-streams'
import assert from 'assert'
import fs from 'fs'
import { pipeline as pipelineCb, Writable } from 'stream'
import { promisify } from 'util'

import { MessagesBuilderResult } from '../../src/messages/MessagesBuilder.js'
import { Suggestion } from '../../src/suggestions/types.js'
import { MessagesBuilderStream } from './MessagesBuilderStream.js'

const pipeline = promisify(pipelineCb)

describe('MessagesBuilder', () => {
  it('does not fail on duplicate parameter types', async () => {
    const readStream = fs.createReadStream(`test/messages/dupe-parameter-types.ndjson`, 'utf-8')
    let receivedError
    await pipeline(
      readStream,
      new NdjsonToMessageStream(),
      new MessagesBuilderStream((err) => (receivedError = err)),
      new Writable({
        objectMode: true,
        write(_result: MessagesBuilderResult, encoding, callback) {
          callback()
        },
      })
    )
    assert(receivedError)
  })

  it('does not fail on cucumber expression syntax errors', async () => {
    const readStream = fs.createReadStream(
      `test/messages/syntax-error-cucumber-expression.ndjson`,
      'utf-8'
    )
    let receivedError
    await pipeline(
      readStream,
      new NdjsonToMessageStream(),
      new MessagesBuilderStream((err) => (receivedError = err)),
      new Writable({
        objectMode: true,
        write(_result: MessagesBuilderResult, encoding, callback) {
          callback()
        },
      })
    )
    assert(receivedError)
  })

  it('builds MessagesBuilder from a message stream with parameter types', async () => {
    const readStream = fs.createReadStream(`test/messages/messages.ndjson`, 'utf-8')
    let result: MessagesBuilderResult
    await pipeline(
      readStream,
      new NdjsonToMessageStream(),
      new MessagesBuilderStream(),
      new Writable({
        objectMode: true,
        write(_result: MessagesBuilderResult, encoding, callback) {
          result = _result
          callback()
        },
      })
    )
    const expectedSuggestions: Suggestion[] = [
      {
        segments: ['I select the ', ['2nd'], ' snippet'],
        label: 'I select the {ordinal} snippet',
        matched: true,
      },
      {
        segments: [
          'I type ',
          ['"I have ${1|11,17,23|} cukes on my ${2|belly,table,tree|}"', '"cukes"'],
        ],
        label: 'I type {string}',
        matched: true,
      },
      {
        segments: ['the following Gherkin step texts exist:'],
        label: 'the following Gherkin step texts exist:',
        matched: true,
      },
      {
        segments: ['the following Step Definitions exist:'],
        label: 'the following Step Definitions exist:',
        matched: true,
      },
      {
        segments: [
          'the LSP snippet should be ',
          ['"I have ${1|11,17,23|} cukes on my ${2|belly,table,tree|}"', '"cukes"'],
        ],
        label: 'the LSP snippet should be {string}',
        matched: true,
      },
      {
        segments: ['the suggestions should be empty'],
        label: 'the suggestions should be empty',
        matched: true,
      },
      {
        segments: ['the suggestions should be:'],
        label: 'the suggestions should be:',
        matched: true,
      },
    ]
    assert.deepStrictEqual(result!.suggestions, expectedSuggestions)

    const expectedExpressionSources = [
      'the following Gherkin step texts exist:',
      'the following Step Definitions exist:',
      'I type {string}',
      'I select the {ordinal} snippet',
      'the suggestions should be:',
      'the suggestions should be empty',
      'the LSP snippet should be {string}',
    ]
    assert.deepStrictEqual(
      result!.expressions.map((e) => e.source),
      expectedExpressionSources
    )
  })
})
