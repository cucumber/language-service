import { CucumberExpressionGenerator, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import {
  CodeAction,
  CodeActionKind,
  CreateFile,
  Diagnostic,
  TextDocumentEdit,
  TextEdit,
  VersionedTextDocumentIdentifier,
} from 'vscode-languageserver-types'

import { getLanguage } from '../tree-sitter/languages.js'
import { LanguageName } from '../tree-sitter/types.js'
import { diagnosticCodeUndefinedStep } from './constants.js'
import { stepDefinitionSnippet } from './snippet/stepDefinitionSnippet.js'

export function getGenerateSnippetCodeActions(
  diagnostics: Diagnostic[],
  uri: string,
  mustacheTemplate: string,
  languageName: LanguageName,
  registry: ParameterTypeRegistry
): CodeAction[] {
  const undefinedStepDiagnostic = diagnostics.find((d) => d.code === diagnosticCodeUndefinedStep)
  const language = getLanguage(languageName)
  const { types, names } = language
  const stepText = undefinedStepDiagnostic?.data?.stepText
  if (undefinedStepDiagnostic && stepText && uri) {
    const generator = new CucumberExpressionGenerator(() => registry.parameterTypes)
    const generatedExpressions = generator.generateExpressions(stepText)

    const snippets = generatedExpressions.map((generatedExpression) =>
      stepDefinitionSnippet(generatedExpression, mustacheTemplate, types, names)
    )

    const ca: CodeAction = {
      title: 'Generate step definition',
      diagnostics: [undefinedStepDiagnostic],
      kind: CodeActionKind.QuickFix,
      edit: {
        documentChanges: [
          CreateFile.create(uri, {
            ignoreIfExists: true,
            overwrite: true,
          }),
          ...snippets.map((snippet) =>
            TextDocumentEdit.create(VersionedTextDocumentIdentifier.create(uri, 0), [
              TextEdit.insert({ line: 0, character: 0 }, snippet),
            ])
          ),
        ],
      },
      isPreferred: true,
    }
    return [ca]
  }
  return []
}
