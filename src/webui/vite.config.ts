import { defineConfig } from 'vite'

export default defineConfig({
    build:{
        target: 'esnext',
        minify: false,
        lib: {
          entry: 'src/NapCat.ts',
          formats: ['cjs'],
          fileName: () => 'renderer.js',
        }
    }
});