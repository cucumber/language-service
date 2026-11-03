import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import { createNodeResolver, flatConfigs as importX } from 'eslint-plugin-import-x'
import n from 'eslint-plugin-n'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'

const files = ['**/*.ts']

export default [
  { ignores: ['**/*.{js,cjs,mjs}'] },
  ...[
    js.configs.recommended,
    {
      ...importX.typescript,
      settings: {
        ...importX.typescript.settings,
        'import-x/resolver': undefined,
        'import-x/resolver-next': [createNodeResolver()],
      },
    },
    ...tsPlugin.configs['flat/recommended'],
    prettierRecommended,
  ].map((config) => ({ ...config, files })),
  {
    files,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      n,
    },
    rules: {
      'import-x/no-cycle': 'error',
      'n/no-extraneous-import': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-control-regex': 'off',
    },
  },
  {
    files: ['test/**'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
]
