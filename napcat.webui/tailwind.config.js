import { heroui } from '@heroui/theme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  safelist: [
    {
      pattern:
        /bg-(primary|secondary|success|danger|warning|default)-(50|100|200|300|400|500|600|700|800|900)/
    }
  ],
  theme: {
    extend: {}
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#f31260',
              foreground: '#fff',
              50: '#fee7ef',
              100: '#fdd0df',
              200: '#faa0bf',
              300: '#f871a0',
              400: '#f54180',
              500: '#f31260',
              600: '#c20e4d',
              700: '#920b3a',
              800: '#610726',
              900: '#310413'
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
              900: '#690A66'
            }
          }
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
              900: '#fee7ef'
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
              900: '#FEEAF6'
            }
          }
        }
      }
    })
  ]
}
