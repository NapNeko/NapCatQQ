import { defineConfig } from 'vite';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';

const nodeModules = [...builtinModules, builtinModules.map((m) => `node:${m}`)].flat();

/**
 * CLI 构建配置
 * 产出 dist/cli.mjs — 将 ws 和 napcat-rpc 打包进去，可独立运行
 *
 * 使用方式：node dist/cli.mjs [ws-url] [options]
 */
export default defineConfig({
  resolve: {
    conditions: ['node', 'default'],
    alias: {
      'napcat-rpc': resolve(__dirname, '../napcat-rpc/src/index.ts'),
    },
  },
  build: {
    sourcemap: false,
    target: 'esnext',
    minify: false,
    outDir: 'dist',
    emptyOutDir: false, // 不清空，和插件产物共存
    lib: {
      entry: 'cli/index.ts',
      formats: ['es'],
      fileName: () => 'cli.mjs',
    },
    rollupOptions: {
      // 只排除 Node 内置模块，ws 和 napcat-rpc 打包进去
      external: nodeModules,
      output: {
        banner: '#!/usr/bin/env node',
      },
    },
  },
  plugins: [nodeResolve()],
});
