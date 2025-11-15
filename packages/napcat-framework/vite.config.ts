import cp from 'vite-plugin-cp';
import { defineConfig, PluginOption, UserConfig } from 'vite';
import path, { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { autoIncludeTSPlugin } from 'napcat-vite/vite-auto-include.js';
import { builtinModules } from 'module';
import react from '@vitejs/plugin-react-swc';
import napcatVersion from 'napcat-vite/vite-plugin-version.js';
// 依赖排除
const external = [
  'silk-wasm',
  'ws',
  'express',
];
const nodeModules = [...builtinModules, builtinModules.map((m) => `node:${m}`)].flat();
const FrameworkBaseConfigPlugin: PluginOption[] = [
  autoIncludeTSPlugin({
    entries: [
      { entry: 'napcat.ts', dir: path.resolve(__dirname, '../napcat-core/protocol') },
      { entry: 'napcat.ts', dir: path.resolve(__dirname, '../napcat-onebot/action/test') },
    ],
  }),
  react({ tsDecorators: true }),
  cp({
    targets: [
      { src: '../napcat-napi-loader/', dest: 'dist', flatten: true },
      { src: '../napcat-native/', dest: 'dist/native', flatten: false },
      { src: './manifest.json', dest: 'dist' },
      { src: '../napcat-core/external/napcat.json', dest: 'dist/config/' },
      { src: '../napcat-webui-frontend/dist/', dest: 'dist/static/', flatten: false },
      { src: './liteloader.cjs', dest: 'dist' },
      { src: './napcat.cjs', dest: 'dist' },
      { src: './nativeLoader.cjs', dest: 'dist' },
      { src: './preload.cjs', dest: 'dist' },
      { src: './renderer.js', dest: 'dist' },
      { src: '../../package.json', dest: 'dist' },
      { src: '../../logo.png', dest: 'dist' },
    ],
  }),
  nodeResolve(),
  napcatVersion(),
];
const FrameworkBaseConfig = () =>
  defineConfig({
    resolve: {
      conditions: ['node', 'default'],
      alias: {
        '@/napcat-core': resolve(__dirname, '../napcat-core'),
        '@/napcat-common': resolve(__dirname, '../napcat-common'),
        '@/napcat-onebot': resolve(__dirname, '../napcat-onebot'),
        '@/napcat-pty': resolve(__dirname, '../napcat-pty'),
        '@/napcat-webui-backend': resolve(__dirname, '../napcat-webui-backend'),
        '@/image-size': resolve(__dirname, '../image-size'),
      },
    },
    build: {
      sourcemap: false,
      target: 'esnext',
      minify: false,
      lib: {
        entry: {
          napcat: path.resolve(__dirname, 'napcat.ts'),
          'audio-worker': path.resolve(__dirname, '../napcat-common/src/audio-worker.ts'),
          'worker/conoutSocketWorker': path.resolve(__dirname, '../napcat-pty/worker/conoutSocketWorker.ts'),
        },
        formats: ['es'],
        fileName: (_, entryName) => `${entryName}.mjs`,
      },
      rollupOptions: {
        external: [...nodeModules, ...external],
      },
    },
  });
export default defineConfig((): UserConfig => {
  return {
    ...FrameworkBaseConfig(),
    plugins: [...FrameworkBaseConfigPlugin],
  };
});
