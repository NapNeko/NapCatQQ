import { defineConfig } from 'vite';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';
import fs from 'fs';

const nodeModules = [...builtinModules, builtinModules.map((m) => `node:${m}`)].flat();

// 构建后拷贝插件到 shell 的插件目录
function copyToShellPlugin () {
  return {
    name: 'copy-to-shell',
    writeBundle () {
      try {
        const sourceDir = resolve(__dirname, 'dist');
        const targetDir = resolve(__dirname, '../napcat-shell/dist/plugins/napcat-plugin-debug');
        const packageJsonSource = resolve(__dirname, 'package.json');

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
          console.log(`[copy-to-shell] Created directory: ${targetDir}`);
        }

        const files = fs.readdirSync(sourceDir);
        let copiedCount = 0;

        files.forEach(file => {
          const sourcePath = resolve(sourceDir, file);
          const targetPath = resolve(targetDir, file);

          if (fs.statSync(sourcePath).isFile()) {
            fs.copyFileSync(sourcePath, targetPath);
            copiedCount++;
          }
        });

        if (fs.existsSync(packageJsonSource)) {
          const packageJsonTarget = resolve(targetDir, 'package.json');
          fs.copyFileSync(packageJsonSource, packageJsonTarget);
          copiedCount++;
        }

        console.log(`[copy-to-shell] Successfully copied ${copiedCount} file(s) to ${targetDir}`);
      } catch (error) {
        console.error('[copy-to-shell] Failed to copy files:', error);
        throw error;
      }
    },
  };
}

export default defineConfig({
  resolve: {
    conditions: ['node', 'default'],
    alias: {
      '@/napcat-core': resolve(__dirname, '../napcat-core'),
      '@': resolve(__dirname, '../'),
    },
  },
  build: {
    sourcemap: false,
    target: 'esnext',
    minify: false,
    lib: {
      entry: 'index.ts',
      formats: ['es'],
      fileName: () => 'index.mjs',
    },
    rollupOptions: {
      external: [...nodeModules, 'ws', 'napcat-rpc'],
    },
  },
  plugins: [nodeResolve(), copyToShellPlugin()],
});
