[![test-javascript](https://github.com/cucumber/language-service/actions/workflows/test-javascript.yml/badge.svg)](https://github.com/cucumber/language-service/actions/workflows/test-javascript.yml)

# Cucumber Language Service

This library implements the services used by [Cucumber Language Server](https://github.com/cucumber/language-server#readme)
and [Cucumber Monaco](https://github.com/cucumber/monaco#readme).

## Supported features

- Languages
  - [x] Java
  - [x] TypeScript
  - [x] TypeScript JSX (TSX)
  - [x] C#
  - [x] PHP
  - [x] Ruby
  - [ ] [Rust](https://github.com/cucumber/language-service/issues/82)
  - [ ] [JavaScript](https://github.com/cucumber/language-service/issues/42)
  - [ ] [Python](https://github.com/cucumber/language-service/issues/49)
- [x] Go to step definition
- [x] Generate step definition
- [x] Code completion
  - [x] Steps
  - [ ] Generic Gherkin keywords
- [x] Formatting / pretty printing
- [x] Syntax highlighting
- [x] Syntax validation (underline undefined steps)
