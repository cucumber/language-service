import assert from 'node:assert'
import { CucumberExpressionGenerator, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import { WasmParserAdapter } from '../../../src/index.js'
import { ExpressionBuilder } from '../../../src/language/ExpressionBuilder.js'
import { getLanguage } from '../../../src/language/languages.js'
import { type LanguageName, LanguageNames, type Source } from '../../../src/language/types.js'
import { stepDefinitionSnippet } from '../../../src/service/snippet/stepDefinitionSnippet.js'

describe('stepDefinitionSnippet', () => {
  let parserAdapter: WasmParserAdapter
  before(async () => {
    parserAdapter = new WasmParserAdapter('dist')
    await parserAdapter.init()
  })

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

      const expressionBuilder = new ExpressionBuilder(parserAdapter)
      const source: Source<LanguageName> = {
        uri: 'file:///tmp/test.x',
        languageName,
        content: snippet,
      }
      const result = expressionBuilder.build([source], [])
      if (result.expressionLinks.length === 1) {
        assert.strictEqual(result.expressionLinks[0].expression.source, '{int} is not {int}')
      }
      console.log(`### Manually verify that this is valid ${languageName}:`)
      console.log(snippet)
    })
  }
})
