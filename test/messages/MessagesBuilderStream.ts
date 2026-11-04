import { Transform, type TransformCallback } from 'node:stream'
import type { Envelope } from '@cucumber/messages'

import { MessagesBuilder } from '../../src/messages/MessagesBuilder.js'

export class MessagesBuilderStream extends Transform {
  private readonly builder = new MessagesBuilder()

  constructor(private readonly errorHandler: (err: Error) => void = () => undefined) {
    super({ objectMode: true })
  }

  _transform(envelope: Envelope, _: BufferEncoding, callback: TransformCallback) {
    this.builder.processEnvelope(envelope, this.errorHandler)
    callback()
  }

  _flush(callback: TransformCallback) {
    callback(null, this.builder.build())
  }
}
