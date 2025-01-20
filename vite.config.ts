import cp from 'vite-plugin-cp';
import { defineConfig, PluginOption, UserConfig } from 'vite';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';
import { swcPlugin } from './swc';

// 依赖排除
const external: string[] = ['silk-wasm', 'ws', 'express', 'qrcode-terminal', 'fluent-ffmpeg', 'piscina'];
const nodeModules: string[] = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)].flat();

const startScripts: string[] = process.env.NAPCAT_BUILDSYS === 'linux' ? [] : ['./script/KillQQ.bat'];

const createPluginOptions = (additionalTargets: { src: string; dest: string; flatten?: boolean }[] = []): PluginOption[] => [
    cp({
        targets: [
            { src: './manifest.json', dest: 'dist' },
            { src: './src/core/external/napcat.json', dest: 'dist/config/' },
            { src: './src/native/packet', dest: 'dist/moehoo', flatten: false },
            { src: './src/framework/liteloader.cjs', dest: 'dist' },
            { src: './src/framework/napcat.cjs', dest: 'dist' },
            { src: './src/framework/preload.cjs', dest: 'dist' },
            { src: './src/framework/renderer.js', dest: 'dist' },
            { src: './package.json', dest: 'dist' },
            { src: './logo.png', dest: 'dist' },
            ...additionalTargets,
            ...startScripts.map((startScript) => ({ src: startScript, dest: 'dist' })),
        ],
    }),
    nodeResolve(),
    swcPlugin(),
];

const createBaseConfig = (entry: { [key: string]: string }): UserConfig => ({
    resolve: {
        conditions: ['node', 'default'],
        alias: {
            '@/core': resolve(__dirname, './src/core'),
            '@': resolve(__dirname, './src'),
            './lib-cov/fluent-ffmpeg': './lib/fluent-ffmpeg',
            '@webapi': resolve(__dirname, './src/webui/src'),
        },
    },
    build: {
        sourcemap: false,
        target: 'esnext',
        minify: false,
        lib: {
            entry,
            formats: ['es'],
            fileName: (_, entryName) => `${entryName}.mjs`,
        },
        rollupOptions: {
            external: [...nodeModules, ...external],
        },
    },
});

const createConfig = (mode: string, entry: { [key: string]: string }, additionalTargets: { src: string; dest: string; flatten?: boolean }[] = []): UserConfig => ({
    ...createBaseConfig(entry),
    plugins: [...createPluginOptions(additionalTargets)],
});

export default defineConfig(({ mode }: { mode: string }): UserConfig => {
    const entries = {
        napcat: `src/${mode}/napcat.ts`,
        'audio-worker': 'src/common/audio-worker.ts',
    };

    const additionalTargets = mode === 'universal' || mode === 'shell' ? [{ src: './launcher/', dest: 'dist', flatten: true }] : [];

    return createConfig(mode, entries, additionalTargets);
});