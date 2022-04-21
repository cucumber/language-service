# Contributing

Thank you for contributing! Please follow these steps before preparing a pull request

## Run the tests

    npm install
    npm test

## Add support for a new programming language

If your contribution is to add support for a new programming language, follow these steps:

1. Add the following files, porting the names and expressions from one of the existing implementations:
   - `test/tree-sitter/testdata/{language}/ParameterTypes.{ext}`
   - `test/tree-sitter/testdata/{language}/StepDefinitions.{ext}`
2. Add a new `src/tree-sitter/{language}Language.ts` file
3. Add the name of the new language to the `LanguageName` type
4. Update `treeSitterLanguageByName`
5. Run tests

As you are working on step 1 and 2 - use [tree-sitter playground](https://tree-sitter.github.io/tree-sitter/playground)
to build your query. The queries must have [capturing nodes](https://tree-sitter.github.io/tree-sitter/using-parsers#query-syntax):

- `defineParameterTypeQueries`: `@expression` and `@name`
- `defineStepDefinitionQueries`: `@expression`
