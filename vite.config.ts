import cp from 'vite-plugin-cp';
import { defineConfig, PluginOption, UserConfig } from 'vite';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';
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
    startScripts = [];
} else if (process.env.NAPCAT_BUILDSYS == 'win32') {
    if (process.env.NAPCAT_BUILDARCH == 'x64') {
    }
    startScripts = ['./script/KillQQ.bat'];
} else {
    startScripts = ['./script/KillQQ.bat'];
}
const FrameworkBaseConfigPlugin: PluginOption[] = [
    cp({
        targets: [
            { src: './manifest.json', dest: 'dist' },
            { src: './src/core/external/napcat.json', dest: 'dist/config/' },
            { src: './static/', dest: 'dist/static/', flatten: false },
            { src: './src/onebot/config/onebot11.json', dest: 'dist/config/' },
            { src: './src/laana/config/laana.json', dest: 'dist/config/' },
            { src: './src/framework/liteloader.cjs', dest: 'dist' },
            { src: './src/framework/napcat.cjs', dest: 'dist' },
            { src: './src/framework/preload.cjs', dest: 'dist' },
            { src: './src/framework/renderer.js', dest: 'dist' },
            { src: './package.json', dest: 'dist' },
            { src: './logo.png', dest: 'dist' },
        ],
    }),
    nodeResolve(),
];
const ShellBaseConfigPlugin: PluginOption[] = [
    cp({
        targets: [
            { src: './static/', dest: 'dist/static/', flatten: false },
            { src: './src/core/external/napcat.json', dest: 'dist/config/' },
            { src: './src/onebot/config/onebot11.json', dest: 'dist/config/' },
            { src: './src/laana/config/laana.json', dest: 'dist/config/' },
            { src: './package.json', dest: 'dist' },
            { src: './launcher/', dest: 'dist', flatten: true },
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
