# Contributing

Thank you for contributing! Please follow these steps before preparing a pull request

## Prerequisites

You need docker installed. This is because the build process uses docker to build wasm files.

## Run the tests

    npm install
    npm test

## Manual testing

If you need to test your changes in an editor, use VSCode.
See [cucumber/vscode/CONTRIBUTING.md](https://github.com/cucumber/vscode/blob/main/CONTRIBUTING.md) for details.

## Add support for a new programming language

If your contribution is to add support for a new programming language, follow these steps:

1. Run `npm install -E tree-sitter-{language}`
2. Update `languages` in `scripts/build.js`
3. Run `npm install` - this should build a wasm for the new language into `dist/{language}.wasm`
4. Add the following files, porting the names and expressions from one of the existing implementations:
   - `test/language/testdata/{language}/ParameterTypes.{ext}` (if the Cucumber implementation supports [Cucumber Expressions](https://github.com/cucumber/cucumber-expressions#readme))
   - `test/language/testdata/{language}/StepDefinitions.{ext}`
5. Add a new `src/language/{language}Language.ts` file
   - If the Cucumber implementation does not support Cucumber Expressions, make `defineParameterTypeQueries` an empty array
6. Add the name of the new language to the `LanguageName` type
7. Update `treeSitterLanguageByName` in `src/language/ExpressionBuilder.ts`
8. Update `src/tree-sitter-node/NodeParserAdapter.ts`
9. Run tests

As you are working on step 4 and 5 - use [tree-sitter playground](https://tree-sitter.github.io/tree-sitter/playground)
to build your query. The queries must have [capturing nodes](https://tree-sitter.github.io/tree-sitter/using-parsers#query-syntax):

- `defineParameterTypeQueries`: `@expression`, `@name` and `@root`
- `defineStepDefinitionQueries`: `@expression` and `@root`

## One last thing

Please make sure all code is formatted before submitting a pull request

    npm run eslint-fix
