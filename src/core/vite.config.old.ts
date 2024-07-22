import { UserConfig, defineConfig } from 'vite';
import { builtinModules } from 'module';
import obfuscator from 'rollup-plugin-obfuscator';
import { Plugin } from 'vite';
import path from 'node:path';
import dts from 'vite-plugin-dts';
import cp from 'vite-plugin-cp';
import babel from 'vite-plugin-babel';

const external: string[] = [ /* Empty */];
const nodeModules = [...builtinModules, builtinModules.map(m => `node:${m}`)].flat();

const baseConfig: UserConfig = {
  build: {
    target: 'modules',
    outDir: './',
    lib: {
      name: '@napneko/core',
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'src/index.ts'),
        qqnt: path.resolve(__dirname, 'src/qqnt/index.ts'),
        'qqnt/apis': path.resolve(__dirname, 'src/qqnt/apis/index.ts'),
        'qqnt/listeners': path.resolve(__dirname, 'src/qqnt/listeners/index.ts'),
        'qqnt/entities': path.resolve(__dirname, 'src/qqnt/entities/index.ts'),
        'qqnt/adapters': path.resolve(__dirname, 'src/qqnt/adapters/index.ts'),
        'qqnt/services': path.resolve(__dirname, 'src/qqnt/services/index.ts'),
        service: path.resolve(__dirname, 'src/service/index.ts')
      },
      output: {
        // 输出设置为系统模块格式，确保目录结构被保持
        format: 'esm',
        dir: path.resolve(__dirname, './dist/core/src'),
        entryFileNames: '[name]/index.js',
        chunkFileNames: '[name]/[hash]/index.js',
        // preserveModules: true, // 保持模块结构
        // preserveModulesRoot: 'src'
      },
      external: [...nodeModules, ...external],
    },
  },
  resolve: {
    alias: {
      '@/common': path.resolve(__dirname, '../common'),
      '@/core': path.resolve(__dirname, './src'),
      './lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg',
    }
  },
};

const commonPlugins: Plugin[] = [
  babel({
    filter: /.*\.(ts)$/,
    babelConfig: {
      babelrc: false,
      configFile: false,
      presets: ["@babel/preset-typescript"],
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        '@babel/plugin-proposal-class-properties',
      ],
    },
  }),
  dts({
    outDir: './dist',
    staticImport: true,
    rollupTypes: false,
    include: 'src/**/*.ts',
  }),
  cp({
    targets: [
      // ...external.map(genCpModule),
      { src: './pub-package.json', dest: '../core.lib', rename: 'package.json' },
    ]
  })
];
export default defineConfig(({ mode }) => {
  const result: UserConfig = { ...baseConfig };
  if (mode === 'production') {
    result.build!.minify = 'esbuild';
    result.plugins = [
      obfuscator({
        options: {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          debugProtection: false,
          disableConsoleOutput: false,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          renameGlobals: false,
          rotateStringArray: true,
          selfDefending: true,
          stringArray: true,
          stringArrayEncoding: ['base64'],
          stringArrayThreshold: 0.75,
          transformObjectKeys: true,
          unicodeEscapeSequence: false
        },
        include: ['src/**/*.js', 'src/**/*.ts'],
      }),
      ...commonPlugins
    ];
  } else {
    result.build!.minify = false;
    result.plugins = [...commonPlugins];
  }

  return result;
});
