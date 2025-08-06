import cp from 'vite-plugin-cp';
import { defineConfig, PluginOption, UserConfig } from 'vite';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';
import { performanceMonitorPlugin } from './vite-plugin-performance-monitor';
//依赖排除
const external = [
    'silk-wasm',
    'ws',
    'express'
];
const nodeModules = [...builtinModules, builtinModules.map((m) => `node:${m}`)].flat();

let startScripts: string[] | undefined = undefined;
if (process.env.NAPCAT_BUILDSYS == 'linux') {
    startScripts = [];
} else if (process.env.NAPCAT_BUILDSYS == 'win32') {
    startScripts = ['./script/KillQQ.bat'];
} else {
    startScripts = ['./script/KillQQ.bat'];
}

const UniversalBaseConfigPlugin: PluginOption[] = [
    // performanceMonitorPlugin({
    //     enabled: process.env.NODE_ENV !== 'production',
    //     exclude: [/node_modules/, /\.min\./, /performance-monitor/],
    //     include: [/\.ts$/, /\.js$/]
    // }),
    cp({
        targets: [
            { src: './manifest.json', dest: 'dist' },
            { src: './src/core/external/napcat.json', dest: 'dist/config/' },
            { src: './src/native/packet', dest: 'dist/moehoo', flatten: false },
            { src: './src/native/pty', dest: 'dist/pty', flatten: false },
            { src: './napcat.webui/dist/', dest: 'dist/static/', flatten: false },
            { src: './src/framework/liteloader.cjs', dest: 'dist' },
            { src: './src/framework/napcat.cjs', dest: 'dist' },
            { src: './src/framework/preload.cjs', dest: 'dist' },
            { src: './src/framework/renderer.js', dest: 'dist' },
            { src: './package.json', dest: 'dist' },
            { src: './logo.png', dest: 'dist' },
            { src: './launcher/', dest: 'dist', flatten: true },
            ...startScripts.map((startScript) => {
                return { src: startScript, dest: 'dist' };
            }),
        ],
    }),
    nodeResolve(),
];

const FrameworkBaseConfigPlugin: PluginOption[] = [
    // performanceMonitorPlugin({
    //     enabled: process.env.NODE_ENV !== 'production',
    //     exclude: [/node_modules/, /\.min\./, /performance-monitor/],
    //     include: [/\.ts$/, /\.js$/]
    // }),
    cp({
        targets: [
            { src: './manifest.json', dest: 'dist' },
            { src: './src/core/external/napcat.json', dest: 'dist/config/' },
            { src: './src/native/packet', dest: 'dist/moehoo', flatten: false },
            { src: './src/native/pty', dest: 'dist/pty', flatten: false },
            { src: './napcat.webui/dist/', dest: 'dist/static/', flatten: false },
            { src: './src/framework/liteloader.cjs', dest: 'dist' },
            { src: './src/framework/napcat.cjs', dest: 'dist' },
            { src: './src/framework/nativeLoader.cjs', dest: 'dist' },
            { src: './src/framework/preload.cjs', dest: 'dist' },
            { src: './src/framework/renderer.js', dest: 'dist' },
            { src: './package.json', dest: 'dist' },
            { src: './logo.png', dest: 'dist' },
        ],
    }),
    nodeResolve(),
];

const ShellBaseConfigPlugin: PluginOption[] = [
    // performanceMonitorPlugin({
    //     enabled: process.env.NODE_ENV !== 'production',
    //     exclude: [/node_modules/, /\.min\./, /performance-monitor/],
    //     include: [/\.ts$/, /\.js$/]
    // }),
    cp({
        targets: [
            { src: './src/native/packet', dest: 'dist/moehoo', flatten: false },
            { src: './src/native/pty', dest: 'dist/pty', flatten: false },
            { src: './napcat.webui/dist/', dest: 'dist/static/', flatten: false },
            { src: './src/core/external/napcat.json', dest: 'dist/config/' },
            { src: './package.json', dest: 'dist' },
            { src: './launcher/', dest: 'dist', flatten: true },
            ...startScripts.map((startScript) => {
                return { src: startScript, dest: 'dist' };
            }),
        ],
    }),
    nodeResolve(),
];
const UniversalBaseConfig = () =>
    defineConfig({
        resolve: {
            conditions: ['node', 'default'],
            alias: {
                '@/core': resolve(__dirname, './src/core'),
                '@': resolve(__dirname, './src'),
                '@webapi': resolve(__dirname, './src/webui/src'),
            },
        },
        build: {
            sourcemap: false,
            target: 'esnext',
            minify: false,
            lib: {
                entry: {
                    napcat: 'src/universal/napcat.ts',
                    'audio-worker': 'src/common/audio-worker.ts',
                    'worker/conoutSocketWorker': 'src/pty/worker/conoutSocketWorker.ts',
                },
                formats: ['es'],
                fileName: (_, entryName) => `${entryName}.mjs`,
            },
            rollupOptions: {
                external: [...nodeModules, ...external],
            },
        },
    });

const ShellBaseConfig = () =>
    defineConfig({
        resolve: {
            conditions: ['node', 'default'],
            alias: {
                '@/core': resolve(__dirname, './src/core'),
                '@': resolve(__dirname, './src'),
                '@webapi': resolve(__dirname, './src/webui/src'),
            },
        },
        build: {
            sourcemap: false,
            target: 'esnext',
            minify: false,
            lib: {
                entry: {
                    napcat: 'src/shell/napcat.ts',
                    'audio-worker': 'src/common/audio-worker.ts',
                    'worker/conoutSocketWorker': 'src/pty/worker/conoutSocketWorker.ts',
                },
                formats: ['es'],
                fileName: (_, entryName) => `${entryName}.mjs`,
            },
            rollupOptions: {
                external: [...nodeModules, ...external],
            },
        },
    });

const FrameworkBaseConfig = () =>
    defineConfig({
        resolve: {
            conditions: ['node', 'default'],
            alias: {
                '@/core': resolve(__dirname, './src/core'),
                '@': resolve(__dirname, './src'),
                '@webapi': resolve(__dirname, './src/webui/src'),
            },
        },
        build: {
            sourcemap: false,
            target: 'esnext',
            minify: false,
            lib: {
                entry: {
                    napcat: 'src/framework/napcat.ts',
                    'audio-worker': 'src/common/audio-worker.ts',
                    'worker/conoutSocketWorker': 'src/pty/worker/conoutSocketWorker.ts',
                },
                formats: ['es'],
                fileName: (_, entryName) => `${entryName}.mjs`,
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
    } else if (mode == 'universal') {
        return {
            ...UniversalBaseConfig(),
            plugins: [...UniversalBaseConfigPlugin],
        };
    } else if (mode == 'shell-analysis') {
        return {
            ...ShellBaseConfig(),
            plugins: [
                performanceMonitorPlugin({
                    exclude: [/node_modules/, /\.min\./, /performance-monitor\.ts$/, /packet/],
                    include: [/\.ts$/, /\.js$/]
                }),
                ...ShellBaseConfigPlugin
            ],
        };
    } else
        return {
            ...FrameworkBaseConfig(),
            plugins: [...FrameworkBaseConfigPlugin],
        };
});
