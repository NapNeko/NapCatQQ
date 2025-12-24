import { heroui } from '@heroui/theme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    {
      pattern:
        /bg-(primary|secondary|success|danger|warning|default)-(50|100|200|300|400|500|600|700|800|900)/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'JetBrains Mono',
          'monospace',
        ],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#FF7FAC', // 樱花粉
              foreground: '#fff',
              50: '#FFF0F5',
              100: '#FFE4E9',
              200: '#FFCDD9',
              300: '#FF9EB5',
              400: '#FF7FAC',
              500: '#F33B7C',
              600: '#C92462',
              700: '#991B4B',
              800: '#691233',
              900: '#380A1B',
            },
            secondary: {
              DEFAULT: '#88C0D0', // 冰霜蓝
              foreground: '#fff',
              50: '#F0F9FC',
              100: '#D7F0F8',
              200: '#AEE1F2',
              300: '#88C0D0',
              400: '#5E9FBF',
              500: '#4C8DAE',
              600: '#3A708C',
              700: '#2A546A',
              800: '#1A3748',
              900: '#0B1B26',
            },
            danger: {
              DEFAULT: '#DB3694',
              foreground: '#fff',
              50: '#FEEAF6',
              100: '#FDD7DD',
              200: '#FBAFC4',
              300: '#F485AE',
              400: '#E965A3',
              500: '#DB3694',
              600: '#BC278B',
              700: '#9D1B7F',
              800: '#7F1170',
              900: '#690A66',
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#f31260',
              foreground: '#fff',
              50: '#310413',
              100: '#610726',
              200: '#920b3a',
              300: '#c20e4d',
              400: '#f31260',
              500: '#f54180',
              600: '#f871a0',
              700: '#faa0bf',
              800: '#fdd0df',
              900: '#fee7ef',
            },
            danger: {
              DEFAULT: '#DB3694',
              foreground: '#fff',
              50: '#690A66',
              100: '#7F1170',
              200: '#9D1B7F',
              300: '#BC278B',
              400: '#DB3694',
              500: '#E965A3',
              600: '#F485AE',
              700: '#FBAFC4',
              800: '#FDD7DD',
              900: '#FEEAF6',
            },
          },
        },
      },
    }),
  ],
};
