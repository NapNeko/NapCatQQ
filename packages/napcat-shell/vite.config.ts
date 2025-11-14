import cp from 'vite-plugin-cp';
import { defineConfig, PluginOption, UserConfig } from 'vite';
import path, { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';
import napcatVersion from "napcat-vite/vite-plugin-version.js";
import { autoIncludeTSPlugin } from "napcat-vite/vite-auto-include.js";
import react from '@vitejs/plugin-react-swc';

//依赖排除
const external = [
  'silk-wasm',
  'ws',
  'express'
];

const nodeModules = [...builtinModules, builtinModules.map((m) => `node:${m}`)].flat();
const ShellBaseConfigPlugin: PluginOption[] = [
  react({ tsDecorators: true }),
  autoIncludeTSPlugin({
    entries: [
      { entry: 'napcat.ts', dir: path.resolve(__dirname, '../napcat-onebot/action/test') }
    ]
  }),
  cp({
    targets: [
      { src: '../napcat-native/', dest: 'dist/native', flatten: false },
      { src: '../napcat-webui-frontend/dist/', dest: 'dist/static/', flatten: false },
      { src: '../napcat-core/external/napcat.json', dest: 'dist/config/' },
      { src: '../../package.json', dest: 'dist' },
      { src: '../napcat-shell-loader', dest: 'dist' }
    ],
  }),
  nodeResolve(),
  napcatVersion(),
];
const ShellBaseConfig = () =>
  defineConfig({
    resolve: {
      conditions: ['node', 'default'],
      alias: {
        '@/napcat-core': resolve(__dirname, '../napcat-core'),
        '@/napcat-common': resolve(__dirname, '../napcat-common/src'),
        '@/napcat-onebot': resolve(__dirname, '../napcat-onebot'),
        '@/napcat-pty': resolve(__dirname, '../napcat-pty'),
        '@/napcat-webui-backend': resolve(__dirname, '../napcat-webui-backend/src'),
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
    ...ShellBaseConfig(),
    plugins: [...ShellBaseConfigPlugin],
  };
});
