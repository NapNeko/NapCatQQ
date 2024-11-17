import globals from 'globals';
import ts from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    ...ts.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-var-requires': 'warn',
        },
    },
    ...vue.configs['flat/base'],
    {
        files: ['*.vue', '**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: ts.parser,
            },
        },
    },
    {
        rules: {
            indent: ['error', 4],
            semi: ['error', 'always'],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-var-requires': 'warn',
            'object-curly-spacing': ['error', 'always'],
            'vue/v-for-delimiter-style': ['error', 'in'],
            'vue/require-name-property': 'warn',
            'vue/prefer-true-attribute-shorthand': 'warn',
            'prefer-arrow-callback': 'warn',
        },
    },
    prettier,
    {
        rules: {
            'prettier/prettier': 'warn',
        },
    },
];
