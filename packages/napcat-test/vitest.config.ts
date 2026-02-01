import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@/napcat-image-size': resolve(__dirname, '../napcat-image-size'),
      '@/napcat-test': resolve(__dirname, '.'),
      '@/napcat-common': resolve(__dirname, '../napcat-common'),
      '@/napcat-core': resolve(__dirname, '../napcat-core'),
    },
  },
});
