import eslint_js from '@eslint/js'
import tsEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsEslintParser from '@typescript-eslint/parser'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'

const customTsFlatConfig = [
  {
    name: 'typescript-eslint/base',
    languageOptions: {
      parser: tsEslintParser,
      sourceType: 'module'
    },
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    rules: {
      ...tsEslintPlugin.configs.recommended.rules
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin
    }
  }
]

export default [
  eslint_js.configs.recommended,

  eslintPluginPrettierRecommended,

  ...customTsFlatConfig,
  {
    name: 'global config',
    languageOptions: {
      globals: {
        ...globals.es2022,
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false
      }
    },
    rules: {
      'prettier/prettier': 'error',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      //关闭不能再promise中使用ansyc
      'no-async-promise-executor': 'off',
      //关闭不能再常量中使用??
      'no-constant-binary-expression': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      //禁止失去精度的字面数字
      '@typescript-eslint/no-loss-of-precision': 'off',
      //禁止使用any
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  {
    ignores: ['**/node_modules', '**/dist', '**/output']
  },
  {
    name: 'react-eslint',
    files: ['src/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    languageOptions: {
      ...reactPlugin.configs.recommended.languageOptions
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,

      'react/react-in-jsx-scope': 'off'
    },
    settings: {
      react: {
        // 需要显示安装 react
        version: 'detect'
      }
    }
  },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } }
  },
  eslintConfigPrettier
]
