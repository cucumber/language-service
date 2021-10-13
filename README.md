[![test-javascript](https://github.com/cucumber/language-service/actions/workflows/test-javascript.yml/badge.svg)](https://github.com/cucumber/language-service/actions/workflows/test-javascript.yml)

# Cucumber Language Service

This library implements the services used by [Cucumber Language Server](https://github.com/cucumber/language-server#readme)
and [Cucumber Monaco](https://github.com/cucumber/monaco#readme).

## API

There are two entry-points to the API:

* Tree-Sitter
* Messages

### Tree-Sitter

This is the mode used by the Cucumber Language Server, where source code (Java, Ruby, TypeScript, JavaScript etc)
is available to extract auto-complete information.

### Messages

This mode is used when source code isn't available, but a stream of [Cucumber Messages](https://github.com/cucumber/common/tree/main/messages#readme) is.

## Supported features

- [x] Formatting / pretty printing
- [x] Handle parse errors
- [x] Code completion
  - [x] Steps
  - [ ] Generic Gherkin keywords
- [x] Syntax validation
  - [x] Parse errors
  - [x] Undefined steps
  - [ ] Ambiguous steps
  - [x] Ignore Scenario Outline steps
- [x] [Semantic tokens](https://microsoft.github.io/language-server-protocol/specifications/specification-3-17/#textDocument_semanticTokens) (syntax highlighting)
  - [x] Gherkin keywords
  - [x] Gherkin step parameters
  - [x] DocStrings
  - [x] Data tables
  - [x] Tags
  - [x] Scenario Outline step <placeholders>
  - [x] Examples tables headers
