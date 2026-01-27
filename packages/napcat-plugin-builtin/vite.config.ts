import { defineConfig } from 'vite';
import { resolve } from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import { builtinModules } from 'module';
import fs from 'fs';

const nodeModules = [...builtinModules, builtinModules.map((m) => `node:${m}`)].flat();

// 构建后拷贝插件
function copyToShellPlugin () {
  return {
    name: 'copy-to-shell',
    writeBundle () {
      try {
        const sourceDir = resolve(__dirname, 'dist');
        const targetDir = resolve(__dirname, '../napcat-shell/dist/plugins/builtin');
        const packageJsonSource = resolve(__dirname, 'package.json');

        // 确保目标目录存在
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
          console.log(`[copy-to-shell] Created directory: ${targetDir}`);
        }

        // 拷贝 dist 目录下的所有文件
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

        // 拷贝 package.json
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
      external: (id) => {
        if (nodeModules.includes(id)) return true;
        if (id.startsWith('napcat-')) return true;
        return false;
      },
    },
  },
  plugins: [nodeResolve(), copyToShellPlugin()],
});
