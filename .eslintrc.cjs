module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
        'node': true
    },
    'ignorePatterns': ['src/core/proto/'],
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    'overrides': [
        {
            'env': {
                'node': true
            },
            'files': [
                '.eslintrc.{js,cjs}'
            ],
            'parserOptions': {
                'sourceType': 'script'
            }
        }
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module'
    },
    'plugins': [
        '@typescript-eslint',
        'import'
    ],
    'settings': {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts']
        },
        'import/resolver': {
            'typescript': {
                'alwaysTryTypes': true
            }
        }
    },
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'semi': [
            'error',
            'always'
        ],
        'no-unused-vars': 'off',
        'no-async-promise-executor': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'object-curly-spacing': ['error', 'always'],
    }
};
