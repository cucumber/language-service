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

0. Read and understand tree-sitter. It's job is to query the source code of whatever language you are trying to add support for. By doing this we can find the specific functions or methods that correspond to that languages Cucumber support. This allows the `language-service` to abstract away the language specific components and allows the rest of the program to work in more universal Gherkin space.
1. Run `npm install -E tree-sitter-{language}`
2. Update `languages` in `scripts/build.js` and add it to [cucumber/vscode/README.md](https://github.com/cucumber/vscode/blob/main/README.md).
3. Run `npm install` - this should build a wasm for the new language into `dist/{language}.wasm`
4. Add the following files, porting the names and expressions from one of the existing implementations:
   - `test/language/testdata/{language}/ParameterTypes.{ext}` (if the Cucumber implementation supports [Cucumber Expressions](https://github.com/cucumber/cucumber-expressions#readme))
   - `test/language/testdata/{language}/StepDefinitions.{ext}`
5. Add a new `src/language/{language}Language.ts` file
   - If the Cucumber implementation does not support Cucumber Expressions, make `defineParameterTypeQueries` an empty array
6. Add the name of the new language to the `LanguageName` type
7. Update `languageByName` in `src/language/language.ts`
8. Update `src/tree-sitter-node/NodeParserAdapter.ts`
9. Update `test/language/ExpressionBuilder.test.ts` to include the new language if it supports Cucumber Expressions
10. Run tests

As you are working on step 4 and 5 - use [tree-sitter playground](https://tree-sitter.github.io/tree-sitter/playground)
to build your query. The queries _must have_ [capturing nodes](https://tree-sitter.github.io/tree-sitter/using-parsers#query-syntax):

- `defineParameterTypeQueries`: `@expression`, `@name` and `@root`
- `defineStepDefinitionQueries`: `@expression` and `@root`

Changing the names of these aliases will result in test failures, even if they work within the tree-sitter playground.

## Snippets

Languages _should_ (Should as in, will not merge but could technically work) contain a snippet in their respective `src/language/{language}Language.ts`.

Below is the canonical Ruby example:

```
{{ keyword }}('{{ expression }}') do |{{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}{{ /parameters }}|
  // {{ blurb }}
end
```

This is a [Mustache Template](https://mustache.github.io/). Here is the [documentation](https://mustache.github.io/mustache.5.html)

Here there are a number of parameters to use:
`keyword` this your languages Given, When, Then
`expression` this the cucumber expression to associate with the given step definition
`blurb` this is the default place holder blurb for developer
`parameters` and `seenParameter` are the parameters used for development (i.e for Ruby the use of the word date for the parameter in the expression)

## One last thing

Please make sure all code is formatted before submitting a pull request

    npm run eslint-fix
