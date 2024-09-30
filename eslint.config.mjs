// eslint.config.js
import globals from "globals";
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import js from '@eslint/js';

export default [
  {
    files: [
        'src/**/*.ts',
    ],
    ignores: ['dist/**', 'jest.config.ts'],
    languageOptions: {
        parser: typescriptParser,
        parserOptions: {
            ecmaVersion: 6,
            node: true,
            project: './tsconfig.json',
        },
        globals: {
            ...globals.browser,
            Parse: true,
        },
    },
    plugins: {
        '@typescript-eslint': typescriptPlugin,
    },
    rules: {
        ...js.configs.recommended.rules,
        ...typescriptPlugin.configs.recommended.rules,

        // Stuff to re-evaluate later
        // '@typescript-eslint/require-ts-comment-description' : 'error',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
    
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
        eqeqeq: 'error',
        'no-invalid-this': 'error',
        'no-return-assign': 'error',
        'no-unused-expressions': [
          'error',
          {
            allowTernary: true,
          },
        ],
        // 'no-unused-vars': [
        //   'error', {
        //     'args': 'after-used'
        //   }
        // ],
        curly: ['error', 'all'],
        'no-useless-concat': 'error',
        'no-useless-return': 'error',
        'init-declarations': 'error',
        'no-use-before-define': 'error',
        'no-lonely-if': 'error',
        'no-unneeded-ternary': 'error',
        'no-whitespace-before-property': 'error',
        'nonblock-statement-body-position': 'error',
        'no-confusing-arrow': 'error',
        'no-duplicate-imports': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-const': 'error',
        'prefer-template': 'error',
    },
  },
  {
    // spec files
    files: [
        '**/*.spec.ts',
    ],
    ignores: ['dist/**', 'jest.config.ts'],
    languageOptions: {
        parser: typescriptParser,
        parserOptions: {
            ecmaVersion: 6,
            node: true,
            project: './tsconfig.json',
        },
        globals: {
            ...globals.node,
            ...globals.browser,
            ...globals.jest,
            Parse: true,
        },
    },
    plugins: {
        '@typescript-eslint': typescriptPlugin,
    },
    rules: {
        'no-undef': 'off',
    },
  },
  {
    // Configuration for JavaScript files
    files: ['**/*.js'],
    ignores: ['dist/**', '.eslintrc.js'],
  }
]

