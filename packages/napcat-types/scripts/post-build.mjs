import { readdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('../', import.meta.url));
const distDir = join(__dirname, 'dist');

// 允许保留的包（白名单）
const ALLOWED_PACKAGES = [
  '@sinclair/typebox',
  'node:',  // node: 前缀的内置模块
];

// 外部包类型到 any 的映射
const EXTERNAL_TYPE_REPLACEMENTS = {
  // winston
  'winston.Logger': 'any',
  'winston.transport': 'any',
  // express
  'express.Express': 'any',
  'express.Application': 'any',
  'express.Router': 'any',
  'Express': 'any',
  'Request': 'any',
  'Response': 'any',
  'NextFunction': 'any',
  // ws
  'WebSocket': 'any',
  'WebSocketServer': 'any',
  'RawData': 'any',
  // ajv
  'Ajv': 'any',
  'AnySchema': 'any',
  'ValidateFunction': 'any',
  'ValidateFunction<T>': 'any',
  // inversify
  'Container': 'any',
  // async-mutex
  'Mutex': 'any',
  'Semaphore': 'any',
  // napcat-protobuf
  'NapProtoDecodeStructType': 'any',
  'NapProtoEncodeStructType': 'any',
  'NapProtoDecodeStructType<T>': 'any',
  'NapProtoEncodeStructType<T>': 'any',
};

function isAllowedImport (importPath) {
  return ALLOWED_PACKAGES.some(pkg => importPath.startsWith(pkg));
}

function removeExternalImports (content) {
  const lines = content.split('\n');
  const resultLines = [];

  for (const line of lines) {
    // 匹配 import 语句
    const importMatch = line.match(/^import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      // 如果是相对路径或白名单包，保留
      if (importPath.startsWith('.') || importPath.startsWith('/') || isAllowedImport(importPath)) {
        resultLines.push(line);
      }
      // 否则移除该 import
      continue;
    }
    resultLines.push(line);
  }

  return resultLines.join('\n');
}

function replaceExternalTypes (content) {
  let result = content;

  // 替换带泛型的类型（先处理复杂的）
  result = result.replace(/NapProtoDecodeStructType<[^>]+>/g, 'any');
  result = result.replace(/NapProtoEncodeStructType<[^>]+>/g, 'any');
  result = result.replace(/ValidateFunction<[^>]+>/g, 'any');

  // 替换 winston.Logger 等带命名空间的类型
  result = result.replace(/winston\.Logger/g, 'any');
  result = result.replace(/winston\.transport/g, 'any');
  result = result.replace(/express\.Express/g, 'any');
  result = result.replace(/express\.Application/g, 'any');
  result = result.replace(/express\.Router/g, 'any');

  // 替换独立的类型名（需要小心不要替换变量名）
  // 使用类型上下文的模式匹配
  const typeContextPatterns = [
    // : Type
    /:\s*(WebSocket|WebSocketServer|RawData|Ajv|AnySchema|ValidateFunction|Container|Mutex|Semaphore|NapProtoDecodeStructType|NapProtoEncodeStructType|Express|Request|Response|NextFunction)(?=\s*[;,)\]\}|&]|$)/g,
    // <Type>
    /<(WebSocket|WebSocketServer|RawData|Ajv|AnySchema|ValidateFunction|Container|Mutex|Semaphore|NapProtoDecodeStructType|NapProtoEncodeStructType|Express|Request|Response|NextFunction)>/g,
    // Type[]
    /(WebSocket|WebSocketServer|RawData|Ajv|AnySchema|ValidateFunction|Container|Mutex|Semaphore|NapProtoDecodeStructType|NapProtoEncodeStructType|Express|Request|Response|NextFunction)\[\]/g,
    // extends Type
    /extends\s+(WebSocket|WebSocketServer|RawData|Ajv|AnySchema|ValidateFunction|Container|Mutex|Semaphore|NapProtoDecodeStructType|NapProtoEncodeStructType|Express|Request|Response|NextFunction)(?=\s*[{,])/g,
    // implements Type
    /implements\s+(WebSocket|WebSocketServer|RawData|Ajv|AnySchema|ValidateFunction|Container|Mutex|Semaphore|NapProtoDecodeStructType|NapProtoEncodeStructType|Express|Request|Response|NextFunction)(?=\s*[{,])/g,
  ];

  for (const pattern of typeContextPatterns) {
    result = result.replace(pattern, (match, typeName) => {
      return match.replace(typeName, 'any');
    });
  }

  return result;
}

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

  // 1. 移除外部包的 import
  content = removeExternalImports(content);

  // 2. 替换外部类型为 any
  content = replaceExternalTypes(content);

  // 3. Replace "export declare enum" with "export enum"
  content = content.replace(/export declare enum/g, 'export enum');

  // Write back the modified content
  await writeFile(filePath, content, 'utf-8');

  // Rename .d.ts to .ts
  const newPath = filePath.replace(/\.d\.ts$/, '.ts');
  await rename(filePath, newPath);

  //console.log(`Processed: ${basename(filePath)} -> ${basename(newPath)}`);
}

console.log('Starting post-build processing...');
await traverseDirectory(distDir);
console.log('Post-build processing completed!');
