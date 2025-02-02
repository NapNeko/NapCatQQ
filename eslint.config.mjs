import eslint from '@eslint/js';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';
import globals from "globals";

const customTsFlatConfig = [
    {
        name: 'typescript-eslint/base',
        languageOptions: {
            parser: tsEslintParser,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        files: ['**/*.{ts,tsx}'],
        rules: {
            ...tsEslintPlugin.configs.recommended.rules,
            'quotes': ['error', 'single'], // 使用单引号
            'semi': ['error', 'always'], // 强制使用分号
            'indent': ['error', 4], // 使用 4 空格缩进
        },
        plugins: {
            '@typescript-eslint': tsEslintPlugin,
        },
    },
];

export default [eslint.configs.recommended, ...customTsFlatConfig];