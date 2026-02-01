import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.es2023 },
    },
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            './tsconfig.json',
            './apps/frontend/tsconfig.json',
            './apps/backend/tsconfig.json',
          ],
        },
      },
    },
    rules: {
      // Only allow explicit subpath exports + local file imports
      'import/no-internal-modules': [
        'error',
        {
          allow: [
            '@pkg/shared-runtime/*',
            '@pkg/shared-types/*',
            '@app/*',
            './**',
          ],
        },
      ],
      // Enforce deps listed in each workspace package.json
      'import/no-extraneous-dependencies': [
        'error',
        {
          packageDir: [
            '.',
            './apps/frontend',
            './apps/backend',
            './apps/db',
            './apps/infra',
            './packages/shared-runtime',
            './packages/shared-types',
          ],
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },

  // Cross-app boundaries
  {
    files: ['apps/frontend/**/*.{ts,tsx,js,mjs,cjs}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            { target: './apps/frontend', from: './apps/backend' },
            { target: './apps/frontend', from: './apps/db' },
            { target: './apps/frontend', from: './apps/infra' },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/backend/**/*.{ts,tsx,js,mjs,cjs}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            { target: './apps/backend', from: './apps/frontend' },
            { target: './apps/backend', from: './apps/db' },
            { target: './apps/backend', from: './apps/infra' },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/db/**/*.{ts,tsx,js,mjs,cjs}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            { target: './apps/db', from: './apps/frontend' },
            { target: './apps/db', from: './apps/backend' },
            { target: './apps/db', from: './apps/infra' },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/infra/**/*.{ts,tsx,js,mjs,cjs}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            { target: './apps/infra', from: './apps/frontend' },
            { target: './apps/infra', from: './apps/backend' },
            { target: './apps/infra', from: './apps/db' },
          ],
        },
      ],
    },
  },

  // Shared types can't import runtime
  {
    files: ['packages/shared-types/**/*.{ts,tsx,js,mjs,cjs}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@pkg/shared-runtime/*'],
        },
      ],
    },
  },
];
