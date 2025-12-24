import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const backendDebugUrl = env.VITE_DEBUG_BACKEND_URL;
  console.log('backendDebugUrl', backendDebugUrl);
  return {
    plugins: [
      react(),
      tsconfigPaths(),
      ViteImageOptimizer({}),
    ],
    base: '/webui/',
    server: {
      proxy: {
        '/api/ws/terminal': {
          target: backendDebugUrl,
          ws: true,
          changeOrigin: true,
        },
        '/api/Debug/ws': {
          target: backendDebugUrl,
          ws: true,
          changeOrigin: true,
        },
        '/api': backendDebugUrl,
        '/files': backendDebugUrl,
        '/webui/fonts/CustomFont.woff': backendDebugUrl,
        '/webui/sw.js': backendDebugUrl,
      },
    },
    build: {
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          manualChunks (id) {
            if (id.includes('node_modules')) {
              if (id.includes('@heroui/')) {
                return 'heroui';
              }
              if (id.includes('react-dom')) {
                return 'react-dom';
              }
              if (id.includes('react-router-dom')) {
                return 'react-router-dom';
              }
              if (id.includes('react-hook-form')) {
                return 'react-hook-form';
              }
              if (id.includes('react-hot-toast')) {
                return 'react-hot-toast';
              }
              if (id.includes('qface')) {
                return 'qface';
              }
              if (id.includes('@uiw/react-codemirror') || id.includes('@codemirror/view') || id.includes('@codemirror/theme-one-dark')) {
                return 'codemirror-core';
              }
              if (id.includes('@codemirror/lang-')) {
                return 'codemirror-lang';
              }
            }
          },
        },
      },
    },
  };
});
