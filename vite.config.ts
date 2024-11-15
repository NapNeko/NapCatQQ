import cp from 'vite-plugin-cp';
import { defineConfig, PluginOption, UserConfig } from 'vite';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';

const external = ['silk-wasm', 'ws', 'express', 'qrcode-terminal', 'fluent-ffmpeg', 'piscina'];
const nodeModules = [...builtinModules, builtinModules.map(m => `node:${m}`)].flat();

function genCpModule(module: string) {
    return { src: `./node_modules/${module}`, dest: `dist/node_modules/${module}`, flatten: false };
}

let startScripts: string[] | undefined = undefined;
if (process.env.NAPCAT_BUILDSYS == 'linux') {
    startScripts = [];
} else if (process.env.NAPCAT_BUILDSYS == 'win32') {
    startScripts = ['./script/KillQQ.bat'];
} else {
    startScripts = ['./script/KillQQ.bat'];
}

const FrameworkBaseConfigPlugin: PluginOption[] = [
    cp({
        targets: [
            { src: './manifest.json', dest: 'dist' },
            { src: './src/core/external/napcat.json', dest: 'dist/config/' },
            { src: './src/native/packet', dest: 'dist/moehoo', flatten: false },
            { src: './static/', dest: 'dist/static/', flatten: false },
            { src: './src/onebot/config/onebot11.json', dest: 'dist/config/' },
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
            { src: './src/native/packet', dest: 'dist/moehoo', flatten: false },
            { src: './static/', dest: 'dist/static/', flatten: false },
            { src: './src/core/external/napcat.json', dest: 'dist/config/' },
            { src: './src/onebot/config/onebot11.json', dest: 'dist/config/' },
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
            entry: {
                'napcat': 'src/shell/napcat.ts',
                'audio-worker': 'src/common/audio-worker.ts',
            },
            formats: ['es'],
            fileName: (_, entryName) => `${entryName}.mjs`,
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
            entry: {
                'napcat': 'src/framework/napcat.ts',
                'audio-worker': 'src/common/audio-worker.ts',
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
    } else {
        return {
            ...FrameworkBaseConfig(),
            plugins: [...FrameworkBaseConfigPlugin],
        };
    }
});
