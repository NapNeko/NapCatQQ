import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: './',
  server: {
    proxy: {
      // '/api': 'http://192.168.31.196:6099'
      '/api': 'http://127.0.0.1:6099'
    }
  }
})
