/**
 * publish-release-hash.mjs
 *
 * 读取 release.json（不存在则创建），追加新版本的 Shell/Framework napcat.mjs SHA512，
 * 保留最近 100 条后写回文件。
 *
 * 用法:
 *   node .github/scripts/publish-release-hash.mjs \
 *     --version    v4.9.0 \
 *     --shell      ./artifacts/NapCat.Shell/napcat.mjs \
 *     --framework  ./artifacts/NapCat.Framework/napcat.mjs \
 *     --file       ./hash-repo/release.json
 */

import crypto from 'node:crypto';
import fs from 'node:fs';

// ─── CLI 参数解析 ────────────────────────────────────────────────────────────

function parseArgs () {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    result[args[i].replace(/^--/, '')] = args[i + 1];
  }
  return result;
}

const { version, shell: shellPath, framework: frameworkPath, file: outputFile } = parseArgs();

if (!version || !shellPath || !frameworkPath || !outputFile) {
  console.error('Usage: node publish-release-hash.mjs --version <v> --shell <path> --framework <path> --file <path>');
  process.exit(1);
}

// ─── 工具函数 ────────────────────────────────────────────────────────────────

function sha512File (filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha512').update(buf).digest('hex');
}

// ─── 主逻辑 ──────────────────────────────────────────────────────────────────

const MAX_ENTRIES = 100;

// 1. 计算哈希
console.log(`Computing SHA512 for Shell: ${shellPath}`);
const shellHash = sha512File(shellPath);
console.log(`Shell SHA512: ${shellHash}`);

console.log(`Computing SHA512 for Framework: ${frameworkPath}`);
const frameworkHash = sha512File(frameworkPath);
console.log(`Framework SHA512: ${frameworkHash}`);

// 2. 读取现有 release.json，不存在则创建空数组
let entries = [];
if (fs.existsSync(outputFile)) {
  entries = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
  console.log(`Loaded existing ${outputFile} with ${entries.length} entries.`);
} else {
  console.log(`${outputFile} not found, will create it.`);
}

// 3. 追加新条目，去除同版本旧条目，滚动保留最近 MAX_ENTRIES 条
const newEntry = {
  version,
  shell: { sha512: shellHash },
  framework: { sha512: frameworkHash },
  updatedAt: new Date().toISOString(),
};

const updated = [
  ...entries.filter(e => e.version !== version),
  newEntry,
].slice(-MAX_ENTRIES);

// 4. 写回文件
fs.writeFileSync(outputFile, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
console.log(`✅ Written ${updated.length} entries to ${outputFile}`);
