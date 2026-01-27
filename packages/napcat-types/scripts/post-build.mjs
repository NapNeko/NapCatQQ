import { readdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('../', import.meta.url));
const distDir = join(__dirname, 'dist');

async function traverseDirectory (dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await traverseDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
      await processFile(fullPath);
    }
  }
}

async function processFile (filePath) {
  // Read file content
  let content = await readFile(filePath, 'utf-8');

  // Replace "export declare enum" with "export enum"
  content = content.replace(/export declare enum/g, 'export enum');

  // Write back the modified content
  await writeFile(filePath, content, 'utf-8');

  // Rename .d.ts to .ts
  const newPath = filePath.replace(/\.d\.ts$/, '.ts');
  await rename(filePath, newPath);

  console.log(`Processed: ${basename(filePath)} -> ${basename(newPath)}`);
}

console.log('Starting post-build processing...');
await traverseDirectory(distDir);
console.log('Post-build processing completed!');
