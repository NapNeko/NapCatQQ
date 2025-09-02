import { defineConfig } from 'vite';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';

const nodeModules = [...builtinModules, builtinModules.map((m) => `node:${m}`)].flat();

export default defineConfig({
    resolve: {
        conditions: ['node', 'default'],
        alias: {
            '@/core': resolve(__dirname, '../core'),
            '@': resolve(__dirname, '../'),
        },
    },
    build: {
        sourcemap: false,
        target: 'esnext',
        minify: false,
        lib: {
            entry: 'index.ts',
            formats: ['es'],
            fileName: () => 'index.mjs',
        },
        rollupOptions: {
            external: [...nodeModules],
        },
    },
    plugins: [nodeResolve()],
});
