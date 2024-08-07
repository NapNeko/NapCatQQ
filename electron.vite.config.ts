import { defineConfig } from 'electron-vite';
import { defineConfig as defineViteConfig } from 'vite';
import { join, resolve } from 'path';
import viteCp from 'vite-plugin-cp';
import viteZipPack from 'unplugin-zip-pack/vite';
import PluginManifest from './src/liteloader/manifest.json';
import babel from 'vite-plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';

const SRC_DIR = resolve(__dirname, './src');
const OUTPUT_DIR = resolve(__dirname, './dist/plugin');

const corePath = resolve(__dirname, 'src', 'core', 'src');

const BaseConfig = defineViteConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@/core': corePath,
      '@': resolve(__dirname, './src'),
      './lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg',
    },
  },
});

const ConfigBuilder = (type: 'main' | 'preload') => defineViteConfig({
  ...BaseConfig,

  plugins: [
    babel({
      filter: /.*\.(ts|js)$/,
      babelConfig: {
        babelrc: false,
        configFile: false,
        presets: ['@babel/preset-typescript'],
        plugins: [
          //'2018-09', decoratorsBeforeExport: true
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          '@babel/plugin-proposal-class-properties',
        ],
      },
    }),
    nodeResolve(),
  ],
  build: {
    minify: true,
    outDir: resolve(OUTPUT_DIR, `./${type}`),
    lib: {
      entry: resolve(SRC_DIR, `./liteloader/${type}/index.ts`),
      formats: [ 'cjs' ],
      fileName: () => 'index.js',
    },
  },
});

export default defineConfig({
  main: ConfigBuilder('main'),
  preload: ConfigBuilder('preload'),
  renderer: defineViteConfig({
    ...BaseConfig,

    plugins: [
      viteCp({
        targets: [
          // ...external.map(genCpModule),
          { src: './src/napcat.json', dest: join(OUTPUT_DIR, 'config') },
          { src: './static', dest: join(OUTPUT_DIR, 'main', 'static'), flatten: false },
          { src: './src/onebot11/onebot11.json', dest: join(OUTPUT_DIR, 'config') },
          { src: './package.json', dest: OUTPUT_DIR },
          { src: './README.md', dest: OUTPUT_DIR },
          { src: './logo.png', dest: join(OUTPUT_DIR, 'logs') },
          { src: './src/liteloader/manifest.json', dest: OUTPUT_DIR }
        ]
      }),
      viteZipPack({
        in: OUTPUT_DIR,
        out: resolve(__dirname, join('dist', `${PluginManifest.slug}.zip`)),
      }),
    ],
    build: {
      minify: 'esbuild',
      outDir: resolve(OUTPUT_DIR, './renderer'),
      lib: {
        entry: resolve(SRC_DIR, './liteloader/renderer/index.ts'),
        formats: [ 'es' ],
        fileName: () => 'index.js',
      },
      rollupOptions: {
        input: resolve(SRC_DIR, './liteloader/renderer/index.ts'),
      },
    },
  }),
});
