import assert from 'assert'

import { isMarkdownFeatureUri } from '../../src/gherkin/isMarkdownFeatureUri.js'

describe('isMarkdownFeatureUri', () => {
  it('returns true for a .feature.md path', () => {
    assert.strictEqual(isMarkdownFeatureUri('features/login.feature.md'), true)
  })

  it('returns true for a file:// URI pointing at .feature.md', () => {
    assert.strictEqual(isMarkdownFeatureUri('file:///abs/features/login.feature.md'), true)
  })

  it('tolerates a trailing query string', () => {
    assert.strictEqual(isMarkdownFeatureUri('file:///x.feature.md?v=1'), true)
  })

  it('tolerates a trailing fragment', () => {
    assert.strictEqual(isMarkdownFeatureUri('file:///x.feature.md#L10'), true)
  })

  it('returns false for a classic .feature file', () => {
    assert.strictEqual(isMarkdownFeatureUri('features/login.feature'), false)
  })

  it('returns false for an unrelated .md file', () => {
    assert.strictEqual(isMarkdownFeatureUri('docs/README.md'), false)
  })

  it('returns false when uri is undefined or empty', () => {
    assert.strictEqual(isMarkdownFeatureUri(undefined), false)
    assert.strictEqual(isMarkdownFeatureUri(''), false)
  })
})
