import { CucumberExpressionGenerator, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import {
  CodeAction,
  CodeActionKind,
  CreateFile,
  Diagnostic,
  LocationLink,
  TextDocumentEdit,
  TextEdit,
  VersionedTextDocumentIdentifier,
} from 'vscode-languageserver-types'

import { getLanguage } from '../language/languages.js'
import { LanguageName } from '../language/types.js'
import { diagnosticCodeUndefinedStep } from './constants.js'
import { stepDefinitionSnippet } from './snippet/stepDefinitionSnippet.js'

/**
 * Generates LSP code actions for inserting a new Step Definition snippet
 *
 * @param diagnostics all the diagnostics
 * @param link where the snippet should be added
 * @param createFile true if link.targetUri does not exist
 * @param mustacheTemplate template to generae the snippet
 * @param languageName the name of the language we're generating for
 * @param registry parameter types
 */
export function getGenerateSnippetCodeActions(
  diagnostics: Diagnostic[],
  link: LocationLink,
  createFile: boolean,
  mustacheTemplate: string | undefined,
  languageName: LanguageName,
  registry: ParameterTypeRegistry
): CodeAction[] {
  const undefinedStepDiagnostic = diagnostics.find((d) => d.code === diagnosticCodeUndefinedStep)
  const language = getLanguage(languageName)
  const stepKeyword = undefinedStepDiagnostic?.data?.stepKeyword
  const stepText = undefinedStepDiagnostic?.data?.stepText
  if (undefinedStepDiagnostic && stepText) {
    const generator = new CucumberExpressionGenerator(() => registry.parameterTypes)
    const generatedExpressions = generator.generateExpressions(stepText)

    const snippet = stepDefinitionSnippet(
      stepKeyword,
      generatedExpressions,
      mustacheTemplate || language.defaultSnippetTemplate,
      language.snippetParameters
    )

    const documentChanges: (CreateFile | TextDocumentEdit)[] = []
    if (createFile) {
      documentChanges.push(
        CreateFile.create(link.targetUri, {
          ignoreIfExists: true,
          overwrite: true,
        })
      )
    }
    documentChanges.push(
      TextDocumentEdit.create(VersionedTextDocumentIdentifier.create(link.targetUri, 0), [
        TextEdit.replace(link.targetRange, snippet),
      ])
    )
    const ca: CodeAction = {
      title: 'Generate step definition',
      diagnostics: [undefinedStepDiagnostic],
      kind: CodeActionKind.QuickFix,
      edit: {
        documentChanges,
      },
      isPreferred: true,
    }
    return [ca]
  }
  return []
}
