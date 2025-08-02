// eslint.config.js (ESLint Flat Config, July 2025) - STRICT TYPESCRIPT SETUP

import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
	{ ignores: ['dist', 'node_modules', 'build', 'reports', '*.min.js', 'vendor'] },

	// JavaScript files configuration
	{
		files: ['**/*.{js,jsx}'],
		...js.configs.recommended,
		plugins: {
			'@stylistic': stylistic
		},
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				// Third-party libraries
				bootstrap: 'readonly',
				pdfjsLib: 'readonly',
				pdfMake: 'readonly'
			}
		},
		rules: {
			// Error prevention
			'no-unused-vars': ['error', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_'
			}],
			'no-undef': 'error',
			'no-console': 'off',
			'no-debugger': 'warn',
			'no-alert': 'warn',

			// Code quality
			'prefer-const': 'error',
			'no-var': 'error',
			'eqeqeq': ['error', 'always'],
			'curly': ['error', 'all'],
			'brace-style': ['error', '1tbs'],

			// Best practices
			'no-eval': 'error',
			'no-implied-eval': 'error',
			'no-new-func': 'error',
			'no-script-url': 'error',
			'no-proto': 'error',
			'no-iterator': 'error',
			'no-with': 'error',

			// Style consistency (using @stylistic rules)
			'@stylistic/indent': ['error', 'tab', {SwitchCase: 1}],
			'@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/comma-dangle': ['error', 'never'],
			'@stylistic/no-trailing-spaces': 'error',
			'@stylistic/eol-last': 'error',
			'@stylistic/brace-style': ['error', '1tbs'],

			// Modern JavaScript
			'prefer-arrow-callback': 'error',
			'prefer-template': 'error',
			'object-shorthand': 'error',
			'prefer-destructuring': ['error', {
				array: false,
				object: true
			}]
		}
	},

	// TypeScript files configuration - STRICT MODE
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parser: tsparser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				},
				ecmaVersion: 2020,
				sourceType: 'module',
				project: ['./tsconfig.app.json', './tsconfig.node.json'],
				tsconfigRootDir: '.'
			}
		},
		plugins: {
			'@typescript-eslint': tseslint,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'@stylistic': stylistic
		},
		rules: {
			// Extend recommended TypeScript rules
			...tseslint.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,

			// React Refresh
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true }
			],

			// TypeScript specific strict rules
			'@typescript-eslint/no-unused-vars': ['error', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_'
			}],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/no-unnecessary-type-assertion': 'error',
			'@typescript-eslint/prefer-as-const': 'error',

			// Disable conflicting rules
			'no-unused-vars': 'off',
			'no-undef': 'off', // TypeScript handles this

			// Style consistency
			'@stylistic/indent': ['error', 'tab', {SwitchCase: 1}],
			'@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/comma-dangle': ['error', 'never'],
			'@stylistic/no-trailing-spaces': 'error',
			'@stylistic/eol-last': 'error'
		}
	}
];
