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

export function getGenerateSnippetCodeActions(
  diagnostics: Diagnostic[],
  uri: string,
  languageName: LanguageName,
  registry: ParameterTypeRegistry
): CodeAction[] {
  const undefinedStepDiagnostic = diagnostics.find((d) => d.code === 'cucumber.undefined-step')
  const stepText = undefinedStepDiagnostic?.data?.stepText
  if (undefinedStepDiagnostic && stepText && uri) {
    const language = getLanguage(languageName)
    const generator = new CucumberExpressionGenerator(() => registry.parameterTypes)
    const expressions = generator.generateExpressions(stepText)
    const snippets = expressions.map((expression) => language.generateSnippet(expression))

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
