// import PreprocessorDirectives from 'unplugin-preprocessor-directives/vite';
import obfuscator from 'rollup-plugin-obfuscator';
import cp from 'vite-plugin-cp';
import { UserConfig, defineConfig } from 'vite';
import { resolve } from 'path';
import { PluginOption, Plugin } from 'vite';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';
import fs from 'node:fs';
import babel from 'vite-plugin-babel';
//依赖排除
const external = ['silk-wasm', 'ws', 'express', 'fluent-ffmpeg', 'log4js', 'qrcode-terminal'];
const nodeModules = [...builtinModules, builtinModules.map(m => `node:${m}`)].flat();

function genCpModule(module: string) {
  return { src: `./node_modules/${module}`, dest: `dist/node_modules/${module}`, flatten: false };
}

let startScripts: string[] | undefined = undefined;
if (process.env.NAPCAT_BUILDSYS == 'linux') {
  if (process.env.NAPCAT_BUILDARCH == 'x64') {
  }
  startScripts = ['./script/napcat.sh'];
} else if (process.env.NAPCAT_BUILDSYS == 'win32') {
  if (process.env.NAPCAT_BUILDARCH == 'x64') {
  }
  startScripts = ['./script/BootWay05.bat', './script/BootWay05.utf8.bat', './script/dbghelp.dll', './script/BootWay05.ps1', './script/napcat-9912.ps1', './script/napcat-9912-utf8.ps1', './script/napcat-9912.bat', './script/napcat-9912-utf8.bat'];
} else {
  startScripts = ['./script/BootWay05.bat', './script/BootWay05.utf8.bat', './script/dbghelp.dll', './script/BootWay05.ps1', './script/napcat.sh', './script/napcat.ps1', './script/napcat.bat', './script/napcat-utf8.bat', './script/napcat-utf8.ps1', './script/napcat-log.ps1', './script/napcat-9912.ps1', './script/napcat-9912-utf8.ps1', './script/napcat-9912.bat', './script/napcat-9912-utf8.bat'];
}
const LLBaseConfigPlugin: PluginOption[] = [
  // PreprocessorDirectives(),
  babel({
    filter: /.*\.(ts|js)$/,
    babelConfig: {
      babelrc: false,
      configFile: false,
      presets: ["@babel/preset-typescript"],
      plugins: [
        //'2018-09', decoratorsBeforeExport: true
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        '@babel/plugin-proposal-class-properties',
      ],
    },
  }),
  cp({
    targets: [
      { src: './manifest.json', dest: 'dist' },
      { src: './src/liteloader/napcat.cjs', dest: 'dist' },
      { src: './src/liteloader/preload.cjs', dest: 'dist' },
      { src: './src/liteloader/renderer.cjs', dest: 'dist' },
      { src: './logo.png', dest: 'dist' },
    ]
  }),
  nodeResolve(),
];
const ShellBaseConfigPlugin: PluginOption[] = [
  // PreprocessorDirectives(),
  babel({
    filter: /.*\.(ts|js)$/,
    babelConfig: {
      babelrc: false,
      configFile: false,
      presets: ["@babel/preset-typescript"],
      plugins: [
        //'2018-09', decoratorsBeforeExport: true
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        '@babel/plugin-proposal-class-properties',
      ],
    },
  }),
  cp({
    targets: [
      // ...external.map(genCpModule),
      // { src: './src/napcat.json', dest: 'dist/config/' },
      // { src: './static/', dest: 'dist/static/', flatten: false },
      // { src: './src/onebot11/onebot11.json', dest: 'dist/config/' },
      // { src: './package.json', dest: 'dist' },
      // { src: './README.md', dest: 'dist' },
      // { src: './logo.png', dest: 'dist/logs' },
      // ...(startScripts.map((startScript) => {
      //   return { src: startScript, dest: 'dist' };
      // })),
    ]
  }),
  nodeResolve(),
];

const ShellBaseConfig = () => defineConfig({
  resolve: {
    conditions: ['node', 'default'],
    alias: {
      '@/core': resolve(__dirname, './src/core'),
      '@': resolve(__dirname, './src'),
      './lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg',
    },
  },
  build: {
    sourcemap: false,
    target: 'esnext',
    minify: false,
    lib: {
      entry: 'src/shell/napcat.ts',
      formats: ['es'],
      fileName: () => 'napcat.mjs',
    },
    rollupOptions: {
      external: [...nodeModules, ...external]
    },
  },
});

const LLBaseConfig = () => defineConfig({
  resolve: {
    conditions: ['node', 'default'],
    alias: {
      '@/core': resolve(__dirname, './src/core'),
      '@': resolve(__dirname, './src'),
      './lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg',
    },
  },
  build: {
    sourcemap: false,
    target: 'esnext',
    minify: false,
    lib: {
      entry: "src/liteloader/napcat.ts",
      formats: ['es'],
      fileName: () => 'napcat.mjs',
    },
    rollupOptions: {
      external: [...nodeModules, ...external]
    },
  },
});

export default defineConfig(({ mode }): UserConfig => {
  if (mode === 'shell') {
    return {
      ...ShellBaseConfig(),
      plugins: [...ShellBaseConfigPlugin]
    };
  } else {
    return {
      ...LLBaseConfig(),
      plugins: [...LLBaseConfigPlugin],
    };
  }
});
