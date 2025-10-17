# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added
- Add Scala support ([#237](https://github.com/cucumber/language-service/issues/237))
- Add Clojure support ([#271](https://github.com/cucumber/language-service/pull/271))

### Fixed
- Missing `parameter:cucumber` token for Scenario Outline ([#246](https://github.com/cucumber/language-service/issues/246))

## [1.7.0] - 2025-05-18
### Added
- Syntax highlighting for comments (`#`) ([#245](https://github.com/cucumber/language-service/pull/245))
- (Python) Support the pypi-parse step definition matcher used by behave and pytest-bdd ([#236](https://github.com/cucumber/language-service/pull/236))
- Added behat arg detection ([#228](https://github.com/cucumber/language-service/pull/228))
- Added support for Node versions 20, 22 and 23 ([#235](https://github.com/cucumber/language-service/pull/235))
- (Javascript) Support for compiled cjs style step definitions ([#222](https://github.com/cucumber/language-service/pull/222))
- Exposed `buildSuggestionFromCucumberExpression` and `buildSuggestionsFromRegularExpression` in `index.ts` ([#227](https://github.com/cucumber/language-service/pull/227))

### Fixed
- Parameter highlighting for scenario outline steps with leading spaces ([#219](https://github.com/cucumber/language-service/pull/219))
- (Ruby) Support `And` and `But` step definition annotations ([#211](https://github.com/cucumber/language-service/pull/211))
- (Python) Title variants of Behave's decorators (`Step`, `Given`, `When`, `Then`) ([#213](https://github.com/cucumber/language-service/pull/213))
- (PHP) Scoped query to match annotations only (`@Given`) ([#214](https://github.com/cucumber/language-service/pull/214))
- (Go) Find godog step definitions within `method_declaration` ([#215](https://github.com/cucumber/language-service/pull/215))
- Exception thrown for unterminated docstrings ([#216](https://github.com/cucumber/language-service/pull/216))

### Removed
- Dropped support for end-of-life Node version 16 ([#224](https://github.com/cucumber/language-service/pull/224))

## [1.6.0] - 2024-05-12
### Added
- Diagnostics for marking steps as undefined in scenario outlines ([#210](https://github.com/cucumber/language-service/pull/210))

## [1.5.1] - 2024-04-20
### Fixed
- (Java) Detect step definition patterns with concatenated strings ([#202](https://github.com/cucumber/language-service/pull/202))
- (Java) Support `@And` and `@But` step definition annotations ([#202](https://github.com/cucumber/language-service/pull/202))

## [1.5.0] - 2024-04-08
### Added
- (Python) Support for u-strings with step definition patterns ([#173](https://github.com/cucumber/language-service/pull/173))
- (Python) Support for behave's generic step definition decorator ([#200](https://github.com/cucumber/language-service/pull/200))
- (Go) Support for Godog step definitions ([#130](https://github.com/cucumber/language-service/pull/130))
- Malaysian localisation and translations for "Rule" in Vietnamese, Irish, Danish, Dutch ([gherkin v27.0.0](https://github.com/cucumber/gherkin/releases/tag/v27.0.0), [gherkin v28.0.0](https://github.com/cucumber/gherkin/releases/tag/v28.0.0))

### Fixed
- (Python) Fix index failures from partial parameter type matches ([#196](https://github.com/cucumber/language-service/pull/196))
- (Python) Unexpected spaces and commas in generated step definitions ([#160](https://github.com/cucumber/language-service/issues/160))
- (Rust) Support for r# raw strings with step definition patterns ([#176](https://github.com/cucumber/language-service/pull/176))
- (Rust) Line continuation characters in rust step definition patterns ([#179](https://github.com/cucumber/language-service/pull/179))
- Prevent formatting introducing trailing whitespace on headings ([gherkin-utils#35](https://github.com/cucumber/gherkin-utils/pull/35))
- Prevent formatting removing trailing comments ([gherkin-utils#38](https://github.com/cucumber/gherkin-utils/pull/41))
- Format table widths with full-width characters ([gherkin-utils#53](https://github.com/cucumber/gherkin-utils/pull/53))
- Verbose alternation in optional error message ([cucumber-expressions#260](https://github.com/cucumber/cucumber-expressions/pull/260), [cucumber-expressions#253](https://github.com/cucumber/cucumber-expressions/pull/253))

## [1.4.1] - 2023-07-16
### Fixed
- (Python) There was a bug in how long concatenated strings were handled for multi-line regexes
- Updated TreeSitter and numerous other dependencies to promote runtime compatibility with Electron 14.

## [1.4.0] - 2022-12-08
### Added
- Added support for JavaScript - [#42](https://github.com/cucumber/language-service/issues/42), [#115](https://github.com/cucumber/language-service/pull/115), [#120](https://github.com/cucumber/language-service/pull/120)

### Fixed
- Fixed a regression in the python language implementation for regexes [#119](https://github.com/cucumber/language-service/pull/119)

## [1.3.0] - 2022-11-28
### Added
- Upgraded `cucumber-expressions`, with new `builtin` accessor on parameter types.

## [1.2.0] - 2022-11-18
### Added
- Added context to python snippet to properly support `behave`
- Added `ParameterType` support to the python language implementation. This is currently supported via [cuke4behave](http://gitlab.com/cuke4behave/cuke4behave)

## [1.1.1] - 2022-10-11
### Fixed
- (TypeScript) Fix bug in template literal recognition

## [1.1.0] - 2022-10-10
### Added
- Add support for [document symbols](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_documentSymbol) ([#98](https://github.com/cucumber/language-service/issues/98), [#106](https://github.com/cucumber/language-service/pull/106))
- (Java) Recognise regexps with `(?i)`, with the caveat that the resulting JavaScript `RegExp` is _not_ case insensitive ([#100](https://github.com/cucumber/language-service/issues/100), [#108](https://github.com/cucumber/language-service/pull/108))
- (TypeScript) Add support for template literals without subsitutions. ([#101](https://github.com/cucumber/language-service/issues/101), [#107](https://github.com/cucumber/language-service/pull/107))

## [1.0.1] - 2022-10-10
### Fixed
- Fix rust snippet fn name to lowercase ([#103](https://github.com/cucumber/language-service/issues/103), [#104](https://github.com/cucumber/language-service/pull/104))

## [1.0.0] - 2022-10-05
### Added
- Support for [Cucumber Rust](https://github.com/cucumber-rs/cucumber) ([#82](https://github.com/cucumber/language-service/issues/82), [#99](https://github.com/cucumber/language-service/pull/99))

### Fixed
- Don't throw an error when Regular Expressions have optional capture groups ([#96](https://github.com/cucumber/language-service/issues/96), [#97](https://github.com/cucumber/language-service/pull/97)).

## [0.33.0] - 2022-09-10
### Added
- Add support for `.tsx` ([#87](https://github.com/cucumber/language-service/issues/87) [#90](https://github.com/cucumber/language-service/pull/90))

### Fixed
- RegExp flags in Step Definitions are preserved ([#91](https://github.com/cucumber/language-service/issues/91#issuecomment-1242243037) [#92](https://github.com/cucumber/language-service/pull/92))

## [0.32.0] - 2022-08-27
### Fixed
- Recognize parameter types using array for `regexp` ([#67](https://github.com/cucumber/language-service/issues/67), [#86](https://github.com/cucumber/language-service/pull/86))
- Support escaped single and double quotes in TypeScript and Ruby ([#66](https://github.com/cucumber/language-service/issues/66), [#85](https://github.com/cucumber/language-service/pull/85))
- Highlight `Background` keyword ([#78](https://github.com/cucumber/language-service/pull/78))

## [0.31.0] - 2022-07-14
### Added
- Basic Python Support via behave ([#69](https://github.com/cucumber/language-service/pull/69))

### Changed
- All types are immutable (using `Readonly`)

## [0.30.0] - 2022-06-13
### Fixed
- Better Cucumber Expression support for SpecFlow/C# ([#68](https://github.com/cucumber/language-service/pull/68), [#62](https://github.com/cucumber/language-service/issues/62), [#63](https://github.com/cucumber/language-service/issues/63))

## [0.29.0] - 2022-06-03
### Changed
- The `tree-sitter` module is an optional dependency. This reduces the risk of installation problems on Windows and also makes the library more light weight.

## [0.28.0] - 2022-05-26
### Fixed
- Don't throw an error when generating suggestions for RegExp. ([#60](https://github.com/cucumber/language-service/issues/60), [#61](https://github.com/cucumber/language-service/pull/61))

## [0.27.0] - 2022-05-26
### Fixed
- Make all `tree-sitter-{language}` dependencies optional. They are only needed at runtime for the `NodeParserAdapter` - the
`WasmParserAdapter` does not need them (they use prebuilt `dist/*.wasm` files included in the module).

## [0.26.0] - 2022-05-26
### Fixed
- Handle Cucumber Expression optionals not preceded by space in suggestions

## [0.25.0] - 2022-05-25
### Changed
- `Source.path` has been renamed to `Source.uri`

### Fixed
- Remove dependency on Node `path` from `ExpressionBuilder` in order to make the library work in a browser

## [0.24.1] - 2022-05-25
### Fixed
- Fix handling of `And` and `But` which wasn't properly fixed in `0.24.0`

## [0.24.0] - 2022-05-25
### Changed
- The mustache templating syntax now uses different variables ([#54](https://github.com/cucumber/language-service/pull/54))

### Fixed
- Undefined `And` and `But` steps now generate the correct `Given`, `When` or `Then` keyword, based on parent step(s) ([#54](https://github.com/cucumber/language-service/pull/54))
- Parameters are excluded from method names ([#54](https://github.com/cucumber/language-service/pull/54))
- Generated C# step definitions include the keyword in the method name ([#54](https://github.com/cucumber/language-service/pull/54))

## [0.23.1] - 2022-05-25
### Fixed
- Fix parsing of Java regular expressions by unescaping `\\` to `\`. ([#51](https://github.com/cucumber/language-service/pull/51))

## [0.23.0] - 2022-05-24
### Changed
- Generate a single code action with relative path ([#50](https://github.com/cucumber/language-service/pull/50))

## [0.22.2] - 2022-05-24
### Fixed
- Fix a few bugs in snipet generation

## [0.22.1] - 2022-05-24
### Fixed
- Remove newlines from snippet templates

## [0.22.0] - 2022-05-24
### Added
- Implement generate step definition ([#46](https://github.com/cucumber/language-service/pull/46))

## [0.21.0] - 2022-05-23
### Added
- Implement go to step definition ([#48](https://github.com/cucumber/language-service/pull/48))

## [0.20.4] - 2022-05-12
### Fixed
- Fix release.

## [0.20.3] - 2022-05-12
### Fixed
- Don't fail if a parameter type is already registered. Report it as an error instead.

## [0.20.2] - 2022-05-12
### Fixed
- Fix release.

## [0.20.1] - 2022-05-12
### Fixed
- Don't fail if an expression fails to parse. Report it as an error instead.

## [0.20.0] - 2022-05-11
### Changed
- Made `<Source>` type generic

## [0.19.0] - 2022-05-11

## [0.18.1] - 2022-05-10
### Fixed
- Remove logging

## [0.18.0] - 2022-05-10
### Changed
- Autocomlete suggestions now set `filterText` to prevent VSCode from filtering out suggestions
- Autocomlete suggestions now set `sortText` to display suggestions from undefined steps last

## [0.17.0] - 2022-05-09
### Added
- Ruby support ([#44](https://github.com/cucumber/language-service/pull/44))

### Fixed
- Label suggestions from unmatched steps as `(undefined)` ([#43](https://github.com/cucumber/language-service/pull/43))

## [0.16.0] - 2022-05-05
### Added
- Build suggestions from unmatched gherkin steps ([#40](https://github.com/cucumber/language-service/pull/40))

## [0.15.0] - 2022-04-27
### Added
- Added support for PHP ([#28](https://github.com/cucumber/language-service/pull/28))

### Changed
- Add `ParserAdapter#init()` to public API

## [0.14.4] - 2022-04-25
### Fixed
- Make sure `dist/cjs/package.json` is added to published npm module

## [0.14.3] - 2022-04-25
### Fixed
- Properly export `@cucumber/language-server/node` and `@cucumber/language-server/wasm` modules.

## [0.14.2] - 2022-04-25
### Fixed
- Only build wasm in local development

## [0.14.1] - 2022-04-25
### Fixed
- Fix GitHub Action for releasing

## [0.14.0] - 2022-04-25
### Added
- Added support for C# ([#29](https://github.com/cucumber/language-service/pull/29), [#35](https://github.com/cucumber/language-service/pull/35))
- Added back wasm support that was removed in 0.13.0 ([#33](https://github.com/cucumber/language-service/pull/33))

### Fixed
- Fixed escaping of LSP snippets ([#34](https://github.com/cucumber/language-service/pull/34))

## [0.13.0] - 2022-04-22
### Changed
- Renamed `StepDocument` to `Suggestion`
- The `ExpressionBuilder` constructor has changed. Consumers must provide a `ParserAdapter` - currently a `NodeParserAdapter` is the only implementation.

### Fixed
- Generate suggestions for Cucumber Expressions even if there are no matching steps. ([#16](https://github.com/cucumber/language-service/issues/16), [#32](https://github.com/cucumber/language-service/pull/32))

### Removed
- Support for tree-sitter web bindings have been removed. It can be added back in a later relase by implementing a `WebParserAdapter`.
- Support for Node.js 17 removed - see [tree-sitter/tree-sitter#1503](https://github.com/tree-sitter/tree-sitter/issues/1503)

## [0.12.1] - 2022-02-04
### Fixed
- Add wasm files to npm module

## [0.12.0] - 2022-02-04
### Added
- Add tree-sitter functionality (`ExpressionBuilder`)

## [0.11.0] - 2022-01-10
### Changed
- Upgrade to `@cucumber/cucumber-expressions` version `15.0.1`

## [0.10.1] - 2021-11-08
### Fixed
- Generate semantic tokens that are supported by the Monaco / Visual Studio Code `vs` theme. ([#12](https://github.com/cucumber/language-service/pull/12), [#6](https://github.com/cucumber/language-service/issues/6)).

## [0.10.0] - 2021-11-08
### Removed
- Move `tree-sitter` functionality to `@cucumber/language-server`

## [0.9.0] - 2021-11-04
### Added
- Add optional error handler to `MessageBuilder#processMessage`

## [0.8.0] - 2021-10-21
### Added
- Expose gherkin functions

## [0.7.1] - 2021-10-21
### Fixed
- Include wasm files in npm module

## [0.7.0] - 2021-10-21
### Added
- Set language in buildExpressions
- Add ExpressionBuilder

## [0.6.0] - 2021-10-20
### Added
- TypeScript support

### Changed
- Misc API changes

## [0.5.0] - 2021-10-13
### Added
- Expose service API

## [0.4.0] - 2021-10-13
### Added
- Add code from `@cucumber/suggest` into this module

### Changed
- Completely changed the API

## [0.3.0] - 2021-10-12
### Changed
- Upgrade to `@cucumber/cucumber-expressions 14.0.0`
- Upgrade to `@cucumber/suggest 0.0.6`

## [0.2.0] - 2021-09-15
### Changed
- Upgrade to `@cucumber/cucumber-expressions 13.0.1`

## [0.1.1] - 2021-09-08
### Fixed
- Fix insertion of completion items so it always replaces the full line rather than appending to the end.
([#1737](https://github.com/cucumber/common/pull/1737)
[aslakhellesoy](https://github.com/aslakhellesoy))

## [0.1.0] - 2021-09-07
### Added
- First release
- Add `CucumberInfoBuilder` and `CucumberInfo`
([#1734](https://github.com/cucumber/common/pull/1734)
[aslakhellesoy](https://github.com/aslakhellesoy))
- Document Formatting
([#1732](https://github.com/cucumber/common/pull/1732)
[aslakhellesoy](https://github.com/aslakhellesoy))

[Unreleased]: https://github.com/cucumber/language-service/compare/v1.7.0...HEAD
[1.7.0]: https://github.com/cucumber/language-service/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/cucumber/language-service/compare/v1.5.1...v1.6.0
[1.5.1]: https://github.com/cucumber/language-service/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/cucumber/language-service/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/cucumber/language-service/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/cucumber/language-service/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/cucumber/language-service/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/cucumber/language-service/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/cucumber/language-service/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/cucumber/language-service/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/cucumber/language-service/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/cucumber/language-service/compare/v0.33.0...v1.0.0
[0.33.0]: https://github.com/cucumber/language-service/compare/v0.32.0...v0.33.0
[0.32.0]: https://github.com/cucumber/language-service/compare/v0.31.0...v0.32.0
[0.31.0]: https://github.com/cucumber/language-service/compare/v0.30.0...v0.31.0
[0.30.0]: https://github.com/cucumber/language-service/compare/v0.29.0...v0.30.0
[0.29.0]: https://github.com/cucumber/language-service/compare/v0.28.0...v0.29.0
[0.28.0]: https://github.com/cucumber/language-service/compare/v0.27.0...v0.28.0
[0.27.0]: https://github.com/cucumber/language-service/compare/v0.26.0...v0.27.0
[0.26.0]: https://github.com/cucumber/language-service/compare/v0.25.0...v0.26.0
[0.25.0]: https://github.com/cucumber/language-service/compare/v0.24.1...v0.25.0
[0.24.1]: https://github.com/cucumber/language-service/compare/v0.24.0...v0.24.1
[0.24.0]: https://github.com/cucumber/language-service/compare/v0.23.1...v0.24.0
[0.23.1]: https://github.com/cucumber/language-service/compare/v0.23.0...v0.23.1
[0.23.0]: https://github.com/cucumber/language-service/compare/v0.22.2...v0.23.0
[0.22.2]: https://github.com/cucumber/language-service/compare/v0.22.1...v0.22.2
[0.22.1]: https://github.com/cucumber/language-service/compare/v0.22.0...v0.22.1
[0.22.0]: https://github.com/cucumber/language-service/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/cucumber/language-service/compare/v0.20.4...v0.21.0
[0.20.4]: https://github.com/cucumber/language-service/compare/v0.20.3...v0.20.4
[0.20.3]: https://github.com/cucumber/language-service/compare/v0.20.2...v0.20.3
[0.20.2]: https://github.com/cucumber/language-service/compare/v0.20.1...v0.20.2
[0.20.1]: https://github.com/cucumber/language-service/compare/v0.20.0...v0.20.1
[0.20.0]: https://github.com/cucumber/language-service/compare/v0.19.0...v0.20.0
[0.19.0]: https://github.com/cucumber/language-service/compare/v0.18.1...v0.19.0
[0.18.1]: https://github.com/cucumber/language-service/compare/v0.18.0...v0.18.1
[0.18.0]: https://github.com/cucumber/language-service/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/cucumber/language-service/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/cucumber/language-service/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/cucumber/language-service/compare/v0.14.4...v0.15.0
[0.14.4]: https://github.com/cucumber/language-service/compare/v0.14.3...v0.14.4
[0.14.3]: https://github.com/cucumber/language-service/compare/v0.14.2...v0.14.3
[0.14.2]: https://github.com/cucumber/language-service/compare/v0.14.1...v0.14.2
[0.14.1]: https://github.com/cucumber/language-service/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/cucumber/language-service/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/cucumber/language-service/compare/v0.12.1...v0.13.0
[0.12.1]: https://github.com/cucumber/language-service/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/cucumber/language-service/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/cucumber/language-service/compare/v0.10.1...v0.11.0
[0.10.1]: https://github.com/cucumber/language-service/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/cucumber/language-service/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/cucumber/language-service/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/cucumber/language-service/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/cucumber/language-service/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/cucumber/language-service/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/cucumber/language-service/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/cucumber/language-service/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/cucumber/language-service/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/cucumber/language-service/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/cucumber/language-service/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/cucumber/language-service/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/cucumber/language-service/tree/v0.1.0
