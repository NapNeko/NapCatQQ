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
import { version } from 'os';
// "@rollup/plugin-babel": "^6.0.4",
const external = ['silk-wasm', 'ws', 'express', 'fluent-ffmpeg', 'log4js', 'qrcode-terminal'];

const nodeModules = [...builtinModules, builtinModules.map(m => `node:${m}`)].flat();
// let nodeModules = ["fs", "path", "events", "buffer", "url", "crypto", "fs/promise", "fsPromise", "os", "http", "net"]
// nodeModules = [...nodeModules, ...nodeModules.map(m => `node:${m}`)]
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
  startScripts = ['./script/dbghelp.dll', './script/BootWay05-utf8.ps1', './script/BootWay05.ps1', './script/napcat-9912.ps1', './script/napcat-9912-utf8.ps1', './script/napcat-9912.bat', './script/napcat-9912-utf8.bat'];
} else {
  startScripts = ['./script/napcat.sh', './script/napcat.ps1', './script/napcat.bat', './script/napcat-utf8.bat', './script/napcat-utf8.ps1', './script/napcat-log.ps1', './script/napcat-9912.ps1', './script/napcat-9912-utf8.ps1', './script/napcat-9912.bat', './script/napcat-9912-utf8.bat'];
}

const baseConfigPlugin: PluginOption[] = [
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
      { src: './src/napcat.json', dest: 'dist/config/' },
      { src: './static/', dest: 'dist/static/', flatten: false },
      { src: './src/onebot11/onebot11.json', dest: 'dist/config/' },
      { src: './package.json', dest: 'dist' },
      { src: './README.md', dest: 'dist' },
      { src: './logo.png', dest: 'dist/logs' },
      // ...MoeHooModule,
      ...(startScripts.map((startScript) => {
        return { src: startScript, dest: 'dist' };
      })),
    ]
  }),
  nodeResolve(),
];
// if (os.platform() !== 'win32') {
//   startScripts = ['./script/napcat.sh'];
// }



let corePath = resolve(__dirname, './src/core/src');
if (!fs.existsSync(corePath)) {
  corePath = resolve(__dirname, './src/core.lib/src');
}
const baseConfig = (mode: string = 'development') => defineConfig({
  resolve: {
    conditions: ['node', 'default'],
    alias: {
      '@/core': corePath,
      '@': resolve(__dirname, './src'),
      './lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg',
    },
  },
  build: {
    sourcemap: mode === 'development',
    target: 'esnext',
    // minify: mode === 'production' ? 'esbuild' : false,
    // 压缩代码出现了未知问题导致无法运行，暂时不启用
    minify: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'napcat.mjs',
    },
    rollupOptions: {
      // external: [ /node:*/ ],
      external: [...nodeModules, ...external]
    },
  },
});

export default defineConfig(({ mode }): UserConfig => {
  if (mode === 'production') {
    return {
      ...baseConfig(mode),
      plugins: [
        ...baseConfigPlugin,
        // {
        //   ...(obfuscator({
        //     options: {
        //       compact: true,
        //       controlFlowFlattening: true,
        //       controlFlowFlatteningThreshold: 0.75,
        //       deadCodeInjection: true,
        //       deadCodeInjectionThreshold: 0.4,
        //       debugProtection: false,
        //       disableConsoleOutput: false,
        //       identifierNamesGenerator: 'hexadecimal',
        //       log: false,
        //       renameGlobals: false,
        //       rotateStringArray: true,
        //       selfDefending: true,
        //       stringArray: true,
        //       stringArrayEncoding: ['base64'],
        //       stringArrayThreshold: 0.75,
        //       transformObjectKeys: true,
        //       unicodeEscapeSequence: false
        //     },
        //     include: ['src/**/*.js', 'src/**/*.ts'],
        //   }) as Plugin),
        //   enforce: 'post',
        //   apply: 'build',
        // },
      ]
    };
  } else {
    return {
      ...baseConfig(mode),
      plugins: baseConfigPlugin,
    };
  }
});
