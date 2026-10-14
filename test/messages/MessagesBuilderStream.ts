import type { Envelope } from '@cucumber/messages'
import type { TransformCallback } from 'stream'
import { Transform } from 'stream'

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
