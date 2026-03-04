import { createDecipheriv } from 'node:crypto';
import fs from 'node:fs';
import {
  EXT_HEADER_SIZE,
  PAGE_SIZE,
  SALT_SIZE,
  IV_SIZE,
  RESERVE_SIZE,
  SQLITE_HEADER,
  SQLITE_FORMAT,
} from './constants';
import { deriveKeys } from './crypto';

/**
 * 解密单个 SQLCipher 页面
 * @param pageData  原始页数据 (4096 字节)
 * @param encKey    AES-256 密钥
 * @param skipSalt  页 1 需跳过前 16 字节 salt
 */
function decryptPage (pageData: Buffer, encKey: Buffer, skipSalt: number = 0): Buffer {
  const data = pageData.subarray(skipSalt);
  const contentLen = data.length - RESERVE_SIZE;
  const encrypted = data.subarray(0, contentLen);
  const iv = data.subarray(contentLen, contentLen + IV_SIZE);

  const decipher = createDecipheriv('aes-256-cbc', encKey, iv);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * 检查文件是否为 NTQQ 加密数据库
 */
export function isEncryptedNTDB (fileData: Buffer): boolean {
  if (fileData.length < EXT_HEADER_SIZE + PAGE_SIZE) return false;
  return fileData.subarray(0, 16).equals(SQLITE_HEADER);
}

/**
 * 将加密的 NTQQ 数据库解密为标准 SQLite 数据库
 * @param fileData    完整的加密数据库文件内容
 * @param passphrase  服务端返回的密钥口令
 * @returns           解密后的 SQLite 数据库 Buffer，失败返回 null
 */
export function decryptDatabase (fileData: Buffer, passphrase: Buffer): Buffer | null {
  if (!isEncryptedNTDB(fileData)) return null;

  const scData = fileData.subarray(EXT_HEADER_SIZE);
  const totalPages = Math.floor(scData.length / PAGE_SIZE);
  if (totalPages === 0) return null;

  const salt = scData.subarray(0, SALT_SIZE);
  const { encKey } = deriveKeys(passphrase, salt);

  const output = Buffer.alloc(totalPages * PAGE_SIZE);
  let offset = 0;

  for (let pgno = 1; pgno <= totalPages; pgno++) {
    const pageOffset = (pgno - 1) * PAGE_SIZE;
    const rawPage = scData.subarray(pageOffset, pageOffset + PAGE_SIZE);
    const skip = pgno === 1 ? SALT_SIZE : 0;
    const decrypted = decryptPage(rawPage, encKey, skip);

    if (pgno === 1) {
      // 重建 Page 1: SQLite 标准文件头 + 解密内容
      SQLITE_FORMAT.copy(output, 0);
      decrypted.copy(output, 16);
      // 修正 page_size 字段 (offset 16-17, big-endian)
      output.writeUInt16BE(PAGE_SIZE, 16);
      // 保留原始 reserved-bytes-per-page 值 (byte 20)
      // NTQQ SQLCipher 使用 reserved=80 用于 B-tree 布局 (usable=4016)
      // 即使加密保留区 (IV+HMAC) 实际只有 48 字节
      // 清零会导致 SQLite 误判溢出指针，报 "database disk image is malformed"
      offset = PAGE_SIZE;
    } else {
      decrypted.copy(output, offset);
      offset += PAGE_SIZE;
    }
  }

  return output;
}

/**
 * 解密数据库文件并写入输出路径
 * @param inputPath   加密数据库路径
 * @param passphrase  密钥口令
 * @param outputPath  输出路径 (默认: 原路径加 _decrypted 后缀)
 * @returns           输出路径，失败返回 null
 */
export function decryptDatabaseFile (
  inputPath: string,
  passphrase: Buffer,
  outputPath?: string
): string | null {
  const fileData = fs.readFileSync(inputPath);
  const result = decryptDatabase(fileData, passphrase);
  if (!result) return null;

  if (!outputPath) {
    const dotIdx = inputPath.lastIndexOf('.');
    outputPath = dotIdx > 0
      ? inputPath.substring(0, dotIdx) + '_decrypted' + inputPath.substring(dotIdx)
      : inputPath + '_decrypted';
  }

  fs.writeFileSync(outputPath, result);
  return outputPath;
}
