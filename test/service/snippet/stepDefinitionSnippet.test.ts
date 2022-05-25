import { CucumberExpressionGenerator, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import assert from 'assert'

import { ExpressionBuilder } from '../../../src/language/ExpressionBuilder.js'
import { getLanguage } from '../../../src/language/languages.js'
import { LanguageName, LanguageNames, Source } from '../../../src/language/types.js'
import { stepDefinitionSnippet } from '../../../src/service/snippet/stepDefinitionSnippet.js'
import { NodeParserAdapter } from '../../../src/tree-sitter-node/NodeParserAdapter.js'

describe('stepDefinitionSnippet', () => {
  for (const languageName of Object.values(LanguageNames)) {
    // if (languageName !== 'c_sharp') continue
    it(`generates a snippet for ${languageName}`, () => {
      const registry = new ParameterTypeRegistry()
      const generator = new CucumberExpressionGenerator(() => registry.parameterTypes)
      const generatedExpressions = generator.generateExpressions('11 is not 22')
      const language = getLanguage(languageName)
      const snippet = stepDefinitionSnippet(
        'When ',
        generatedExpressions,
        language.defaultSnippetTemplate,
        language.snippetParameters
      )

      const expressionBuilder = new ExpressionBuilder(new NodeParserAdapter())
      const source: Source<LanguageName> = { path: 'test.x', languageName, content: snippet }
      const result = expressionBuilder.build([source], [])
      if (result.expressionLinks.length === 1) {
        assert.strictEqual(result.expressionLinks[0].expression.source, '{int} is not {int}')
      }
      console.log(`### Manually verify that this is valid ${languageName}:`)
      console.log(snippet)
    })
  }
})
