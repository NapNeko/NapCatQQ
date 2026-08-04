import { defineConfig } from 'vite';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';

const nodeModules = [...builtinModules, builtinModules.map((m) => `node:${m}`)].flat();
// 依赖排除（不打包进产物，运行时由宿主提供）
const external = [];

export default defineConfig({
  resolve: {
    conditions: ['node', 'default'],
    alias: {
      '@/napcat-core': resolve(__dirname, '../napcat-core'),
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
      external: [...nodeModules, ...external],
    },
  },
  plugins: [nodeResolve()],
});
