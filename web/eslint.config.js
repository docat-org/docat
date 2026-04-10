import eslintReact from "@eslint-react/eslint-plugin";
import eslintJs from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from 'globals'

export default defineConfig(
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ['dist/**', 'vite-env.d.ts', 'vite.config.ts'],

    // Extend recommended rule sets from:
    // 1. ESLint JS's recommended rules
    // 2. TypeScript ESLint recommended rules
    // 3. ESLint React's recommended-typescript rules
    // 4. Prettier (Must be last to disable conflicting rules)
    extends: [
      eslintJs.configs.recommended,
      tseslint.configs.recommended,
      eslintReact.configs["recommended-typescript"],
      eslintConfigPrettier,
    ],

    // Configure language/parsing options
    languageOptions: {
      ecmaVersion: 'latest', // Allow modern JS syntax
      globals: {
        ...globals.browser, // Allow browser globals like `window`
      },
      parser: tseslint.parser, // Your existing parser
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    // TODO: See if some of these could be fixed
    rules: {
      "@eslint-react/dom-no-dangerously-set-innerhtml": "off",
      "@eslint-react/exhaustive-deps": "off",
      "@eslint-react/set-state-in-effect": "off",
    },
  },
);
