import { readdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = fileURLToPath(new URL('../', import.meta.url));
const distDir = join(__dirname, 'dist');

// 允许保留的包（白名单）
const ALLOWED_PACKAGES = [
  '@sinclair/typebox',
  'node:',  // node: 前缀的内置模块
];

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
  const sourceFile = ts.createSourceFile('declaration.d.ts', result, ts.ScriptTarget.Latest, true);
  const genericTypeNames = new Set(['NapProtoDecodeStructType', 'NapProtoEncodeStructType', 'ValidateFunction']);
  const replacements = [];
  const visit = (node) => {
    const typeName = ts.isTypeReferenceNode(node) ? node.typeName : ts.isImportTypeNode(node) ? node.qualifier : undefined;
    if (typeName && genericTypeNames.has(typeName.getText(sourceFile).split('.').at(-1))) {
      replacements.push({ start: node.getStart(sourceFile), end: node.getEnd() });
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  for (const replacement of replacements.reverse()) {
    result = result.slice(0, replacement.start) + 'any' + result.slice(replacement.end);
  }

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
    /:\s*(WebSocket|WebSocketServer|RawData|Container|NapProtoDecodeStructType|NapProtoEncodeStructType|Express|Request|Response|NextFunction)(?=\s*[;,)\]}|&]|$)/g,
    // <Type>
    /<(WebSocket|WebSocketServer|RawData|Container|NapProtoDecodeStructType|NapProtoEncodeStructType|Express|Request|Response|NextFunction)>/g,
    // Type[]
    /(WebSocket|WebSocketServer|RawData|Container|NapProtoDecodeStructType|NapProtoEncodeStructType|Express|Request|Response|NextFunction)\[\]/g,
    // extends Type
    /extends\s+(WebSocket|WebSocketServer|RawData|Container|NapProtoDecodeStructType|NapProtoEncodeStructType|Express|Request|Response|NextFunction)(?=\s*[{,])/g,
    // implements Type
    /implements\s+(WebSocket|WebSocketServer|RawData|Container|NapProtoDecodeStructType|NapProtoEncodeStructType|Express|Request|Response|NextFunction)(?=\s*[{,])/g,
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

  const parsed = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  if (parsed.parseDiagnostics.length > 0) {
    throw new Error(`Invalid generated declaration ${filePath}: ${parsed.parseDiagnostics.map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')).join('\n')}`);
  }

  // Write back the modified content
  await writeFile(filePath, content, 'utf-8');

  // Rename .d.ts to .ts
  const newPath = filePath.replace(/\.d\.ts$/, '.ts');
  await rename(filePath, newPath);

  // console.log(`Processed: ${basename(filePath)} -> ${basename(newPath)}`);
}

console.log('Starting post-build processing...');
await traverseDirectory(distDir);
console.log('Post-build processing completed!');
