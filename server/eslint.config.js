import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import ts from 'typescript-eslint'

export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        ignores: ['**/node_modules/**', '**/dist/**'],
    },
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    eslintConfigPrettier,
    eslintPluginPrettierRecommended,
    {
        files: ['**/*.{ts,tsx,js,mjs,cjs}'],
        rules: {
            'no-empty': 'off',
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        files: ['**/*.{ts,tsx,js,mjs,cjs}'],
        rules: {
            'prettier/prettier': [
                'warn',
                {
                    endOfLine: 'auto',
                },
            ],
        },
    },
]
