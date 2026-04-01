import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintPluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import ts from 'typescript-eslint'

export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    ...eslintPluginVue.configs['flat/recommended'],
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/public/**'],
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: ts.parser,
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
    eslintConfigPrettier,
    eslintPluginPrettierRecommended,
    {
        files: ['**/*.{ts,tsx,vue}'],
        rules: {
            'no-empty': 'off',
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'no-useless-escape': 'off',
            'no-sparse-arrays': 'off',
            'no-prototype-builtins': 'off',
            'no-use-before-define': 'off',
            'no-case-declarations': 'off',
            'no-console': 'off',
            'no-control-regex': 'off',
            'vue/v-on-event-hyphenation': 'off',
            'vue/custom-event-name-casing': 'off',
            'vue/component-definition-name-casing': 'off',
            'vue/attributes-order': 'off',
            'vue/one-component-per-file': 'off',
            'vue/html-closing-bracket-newline': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/multiline-html-element-content-newline': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/attribute-hyphenation': 'off',
            'vue/html-self-closing': 'off',
            'vue/require-default-prop': 'off',
            'vue/no-arrow-functions-in-watch': 'off',
            'vue/no-v-html': 'off',
            'vue/comment-directive': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/require-prop-types': 'off',
            'vue/html-indent': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
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
        files: ['**/*.{ts,tsx,vue,js}'],
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
