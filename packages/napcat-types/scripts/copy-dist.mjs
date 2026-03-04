// 复制 cp README.md dist/ && cp package.public.json dist/package.json
import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('../', import.meta.url));
await copyFile(
  join(__dirname, 'package.public.json'),
  join(__dirname, 'dist', 'package.json')
);
await copyFile(
  join(__dirname, 'README.md'),
  join(__dirname, 'dist', 'README.md')
);