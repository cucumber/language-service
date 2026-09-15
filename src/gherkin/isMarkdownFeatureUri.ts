/**
 * Returns true when the given URI designates a Gherkin-in-Markdown (`.feature.md`) file.
 *
 * Tolerates `file://` URIs as well as trailing query strings (`?…`) or fragments (`#…`),
 * so both plain paths (`features/foo.feature.md`) and LSP-style URIs
 * (`file:///abs/features/foo.feature.md?v=1`) are recognized.
 */
export function isMarkdownFeatureUri(uri?: string): boolean {
  return !!uri && /\.feature\.md(?:[?#]|$)/.test(uri)
}
