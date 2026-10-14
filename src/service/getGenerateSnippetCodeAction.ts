import type { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import { CucumberExpressionGenerator } from '@cucumber/cucumber-expressions'
import type { CodeAction, Diagnostic, LocationLink } from 'vscode-languageserver-types'
import {
  CodeActionKind,
  CreateFile,
  TextDocumentEdit,
  TextEdit,
  VersionedTextDocumentIdentifier,
} from 'vscode-languageserver-types'

import { getLanguage } from '../language/languages.js'
import type { LanguageName } from '../language/types.js'
import { diagnosticCodeUndefinedStep } from './constants.js'
import { stepDefinitionSnippet } from './snippet/stepDefinitionSnippet.js'

/**
 * Generates LSP code actions for inserting a new Step Definition snippet
 *
 * @param diagnostics all the diagnostics
 * @param link where the snippet should be added
 * @param relativePath the relative path from the workspace root
 * @param createFile true if link.targetUri does not exist
 * @param mustacheTemplate template to generate the snippet
 * @param languageName the name of the language we're generating for
 * @param registry parameter types
 */
export function getGenerateSnippetCodeAction(
  diagnostics: Diagnostic[],
  link: LocationLink,
  relativePath: string,
  createFile: boolean,
  mustacheTemplate: string | undefined,
  languageName: LanguageName,
  registry: ParameterTypeRegistry
): CodeAction | null {
  const undefinedStepDiagnostic = diagnostics.find((d) => d.code === diagnosticCodeUndefinedStep)
  const language = getLanguage(languageName)
  const snippetKeyword = undefinedStepDiagnostic?.data?.snippetKeyword
  const stepText = undefinedStepDiagnostic?.data?.stepText
  if (!undefinedStepDiagnostic || !stepText) {
    return null
  }
  const generator = new CucumberExpressionGenerator(() => registry.parameterTypes)
  const generatedExpressions = generator.generateExpressions(stepText)

  const snippet = stepDefinitionSnippet(
    snippetKeyword,
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
  return {
    title: `Define in ${relativePath}`,
    diagnostics: [undefinedStepDiagnostic],
    kind: CodeActionKind.QuickFix,
    edit: {
      documentChanges,
    },
    isPreferred: true,
  }
}
