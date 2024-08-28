// import PreprocessorDirectives from 'unplugin-preprocessor-directives/vite';
import cp from 'vite-plugin-cp';
import { defineConfig, PluginOption, UserConfig } from 'vite';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';
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
    startScripts = ['./script/BootWay05.ps1', './script/dbghelp.dll',
        './script/BootWay05_init.bat', './script/BootWay05_run.bat', './script/BootWay05_run.utf8.bat', './script/KillQQ.bat'];
} else {
    startScripts = ['./script/BootWay05.ps1', './script/dbghelp.dll',
        './script/BootWay05_init.bat', './script/BootWay05_run.bat', './script/BootWay05_run.utf8.bat', './script/KillQQ.bat'];
}
const FrameworkBaseConfigPlugin: PluginOption[] = [
    // PreprocessorDirectives(),
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
    cp({
        targets: [
            { src: './manifest.json', dest: 'dist' },
            { src: './src/core/external/napcat.json', dest: 'dist/config/' },
            { src: './static/', dest: 'dist/static/', flatten: false },
            { src: './src/onebot/config/onebot11.json', dest: 'dist/config/' },
            { src: './src/framework/liteloader.cjs', dest: 'dist' },
            { src: './src/framework/napcat.cjs', dest: 'dist' },
            { src: './src/framework/preload.cjs', dest: 'dist' },
            { src: './src/framework/renderer.js', dest: 'dist' },
            { src: './package.json', dest: 'dist' },
            { src: './logo.png', dest: 'dist' },
            //...external.map(genCpModule)
        ],
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
            presets: ['@babel/preset-typescript'],
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
            { src: './static/', dest: 'dist/static/', flatten: false },
            // { src: './src/onebot11/onebot11.json', dest: 'dist/config/' },
            { src: './src/core/external/napcat.json', dest: 'dist/config/' },
            { src: './src/onebot/config/onebot11.json', dest: 'dist/config/' },
            { src: './package.json', dest: 'dist' },
            // { src: './README.md', dest: 'dist' },
            // { src: './logo.png', dest: 'dist/logs' },
            ...(startScripts.map((startScript) => {
                return { src: startScript, dest: 'dist' };
            })),
        ],
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
            external: [...nodeModules, ...external],
        },
    },
});

const FrameworkBaseConfig = () => defineConfig({
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
            entry: 'src/framework/napcat.ts',
            formats: ['es'],
            fileName: () => 'napcat.mjs',
        },
        rollupOptions: {
            external: [...nodeModules, ...external],
        },
    },
});

export default defineConfig(({ mode }): UserConfig => {
    if (mode === 'shell') {
        return {
            ...ShellBaseConfig(),
            plugins: [...ShellBaseConfigPlugin],
        };
    } else {
        return {
            ...FrameworkBaseConfig(),
            plugins: [...FrameworkBaseConfigPlugin],
        };
    }
});
