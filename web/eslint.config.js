import js from '@eslint/js'
import pluginReact from 'eslint-plugin-react'
import pluginPrettier from 'eslint-plugin-prettier'
import pluginTypescriptEslint from '@typescript-eslint/eslint-plugin'
import parserTypescriptEslint from '@typescript-eslint/parser'
import { globalIgnores } from 'eslint/config'

export default [
  globalIgnores(['vite-env.d.ts', 'vite.config.ts', 'dist/**/*']),
  js.configs.recommended,
  {
    files: ['*.ts', '*.tsx'],
    languageOptions: {
      parser: parserTypescriptEslint,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': pluginTypescriptEslint
    },
    rules: {
      ...pluginTypescriptEslint.configs['recommended'].rules,
      ...pluginTypescriptEslint.configs['recommended-requiring-type-checking']
        .rules,
      '@typescript-eslint/space-before-function-paren': 'off',
      '@typescript-eslint/no-extra-semi': 'off'
    }
  },
  {
    files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
    plugins: {
      react: pluginReact,
      prettier: pluginPrettier
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly'
      }
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginPrettier.configs.recommended.rules
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
]
