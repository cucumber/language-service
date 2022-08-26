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

1. Read and understand tree-sitter. Its job is to query the source code of whatever language you are trying to add support for. By doing this we can find the specific functions or methods that correspond to that language's Cucumber support. This allows the `language-service` to abstract away the language specific components and allows the rest of the program to work in more universal Gherkin space.
2. Run `npm install -E tree-sitter-{language}`
3. Update `languages` in `scripts/build.js` and add it to [cucumber/vscode/README.md](https://github.com/cucumber/vscode/blob/main/README.md).
4. Run `npm install` - this should build a wasm for the new language into `dist/{language}.wasm`
5. Add `test/language/testdata/{language}/StepDefinitions.{ext}`, porting the names and expressions from one of the existing implementations.
6. If the Cucumber implementation supports [Cucumber Expressions](https://github.com/cucumber/cucumber-expressions#readme), add `test/language/testdata/{language}/ParameterTypes.{ext}`.
7. Add a new `src/language/{language}Language.ts` file
   - If the Cucumber implementation does not support Cucumber Expressions, make `defineParameterTypeQueries` an empty array
8. Add the name of the new language to the `LanguageNames` type
9. Update `languageByName` in `src/language/language.ts`
10. Add a new `case` statement in `src/tree-sitter-node/NodeParserAdapter.ts`
11. Update `cucumberExpressionsSupport` in `test/language/ExpressionBuilder.test.ts` to include the new language if it supports Cucumber Expressions
12. Run tests

As you are working on step 5-7 - use [tree-sitter playground](https://tree-sitter.github.io/tree-sitter/playground)
to build your query. The queries _must have_ [capturing nodes](https://tree-sitter.github.io/tree-sitter/using-parsers#query-syntax):

- `defineParameterTypeQueries`: `@expression`, `@name` and `@root`
- `defineStepDefinitionQueries`: `@expression` and `@root`

Changing the names of these aliases will result in test failures, even if they work within the tree-sitter playground.

## Snippets

Languages _should_ contain a snippet in their respective `src/language/{language}Language.ts`.

Below is the canonical Ruby example:

```
{{ keyword }}('{{ expression }}') do |{{ #parameters }}{{ #seenParameter }}, {{ /seenParameter }}{{ name }}{{ /parameters }}|
  // {{ blurb }}
end
```

This is a [Mustache Template](https://mustache.github.io/). Here is the [documentation](https://mustache.github.io/mustache.5.html)

Here there are a number of properties to use:

- `keyword` is `Given`, `When` or `Then`.
- `expression` is the suggested Cucumber Expression for the undefined step.
- `blurb` is the comment you should put inside the step definition body.
- `parameters` is an array of parameters to use in the function/method/block signature. Each item has three properties:
  - `name` is the name of the parameter.
  - `type` is the type of the parameter (for statically typed languages).
  - `seenParameter` is a boolean which is `false` for the first parameter and `true` for the following ones. Useful for adding a `,`.

## One last thing

Please make sure all code is formatted before submitting a pull request

    npm run eslint-fix
