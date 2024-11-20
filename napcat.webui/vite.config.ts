import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        legacy({
            targets: ['defaults', 'not IE 11'],
            modernPolyfills: ['web.structured-clone'],
        }),
    ],
    base: './',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        proxy: {
            '/api': 'http://localhost:6099',
        },
    },
    build: {
        chunkSizeWarningLimit: 4000,
        rollupOptions: {
            output: {
                chunkFileNames: 'static/js/[name]-[hash].js',
                entryFileNames: 'static/js/[name]-[hash].js',
                assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
                manualChunks(id: string) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/.pnpm/')[1].split('/')[0].toString();
                    }
                },
            },
        },
    },
});
