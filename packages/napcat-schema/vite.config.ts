import { defineConfig } from 'vite';
import path, { resolve } from 'path';
import { builtinModules } from 'module';
import nodeResolve from '@rollup/plugin-node-resolve';
import napcatVersion from 'napcat-vite/vite-plugin-version';
// 依赖排除
const external = [
  'ws',
  'express',
  'electron'
];
const nodeModules = [...builtinModules, builtinModules.map((m) => `node:${m}`)].flat();

export default defineConfig({
  resolve: {
    conditions: ['node', 'default'],
    alias: {
      '@/napcat-rpc': resolve(__dirname, '../napcat-rpc'),
      '@/napcat-onebot': resolve(__dirname, '../napcat-onebot'),
      '@/napcat-common': resolve(__dirname, '../napcat-common'),
      '@/napcat-schema': resolve(__dirname, './src'),
      '@/napcat-core': resolve(__dirname, '../napcat-core'),
      '@/napcat-webui-backend': resolve(__dirname, '../napcat-webui-backend'),
      '@/napcat-image-size': resolve(__dirname, '../napcat-image-size'),
    },
  },
  plugins: [
    nodeResolve(),
    napcatVersion()
  ],
  build: {
    target: 'esnext',
    minify: false,
    emptyOutDir: true,
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, './index.ts'),
      formats: ['es'],
      fileName: () => 'schemas.mjs',
    },
    rollupOptions: {
      external: [
        ...nodeModules,
        ...external
      ]
    },
  },
});
