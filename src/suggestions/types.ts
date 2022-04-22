export type Suggestion = {
  /**
   * The value that is presented to users in an autocomplete.
   */
  label: string

  /**
   * The segments are used to build the contents that will be inserted into the editor
   * after selecting a suggestion.
   *
   * For LSP compatible editors, this can be formatted to an LSP snippet with the
   * lspCompletionSnippet function.
   */
  segments: SuggestionSegments
}

export type SuggestionSegments = readonly SuggestionSegment[]
export type SuggestionSegment = Text | Choices
type Text = string
type Choices = readonly string[]

export type ParameterChoices = Record<string, readonly string[]>
