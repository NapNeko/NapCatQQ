import { defineConfig } from 'vite'

export default defineConfig({
    build:{
        target: 'esnext',
        minify: false,
        lib: {
          entry: 'src/NapCat.ts',
          formats: ['es'],
          fileName: () => 'renderer.js',
        }
    }
});