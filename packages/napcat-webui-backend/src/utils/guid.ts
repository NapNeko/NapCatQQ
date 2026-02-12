import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { protectData, unprotectData } from 'napcat-dpapi';

const GUID_HEADER = Buffer.from([0x00, 0x00, 0x00, 0x14]);
const XOR_KEY = 0x10;

/**
 * Unprotects data using Windows DPAPI via napcat-dpapi.
 */
function dpapiUnprotect (filePath: string): Buffer {
  const encrypted = fs.readFileSync(filePath);
  return Buffer.from(unprotectData(encrypted, null, 'CurrentUser'));
}

/**
 * Protects data using Windows DPAPI and writes to file.
 */
function dpapiProtectAndWrite (filePath: string, data: Buffer): void {
  const encrypted = protectData(data, null, 'CurrentUser');
  fs.writeFileSync(filePath, Buffer.from(encrypted));
}

export class Registry20Utils {
  static getRegistryPath (dataPath: string): string {
    return path.join(dataPath, 'nt_qq', 'global', 'nt_data', 'msf', 'Registry20');
  }

  static readGuid (registryPath: string): string {
    if (!fs.existsSync(registryPath)) {
      throw new Error('Registry20 file not found');
    }
    if (os.platform() !== 'win32') {
      throw new Error('Registry20 decryption is only supported on Windows');
    }

    const decrypted = dpapiUnprotect(registryPath);

    if (decrypted.length < 20) {
      throw new Error(`Decrypted data too short (got ${decrypted.length} bytes, need 20)`);
    }

    // Decode payload: header(4) + obfuscated_guid(16)
    const payload = decrypted.subarray(4, 20);
    const guidBuf = Buffer.alloc(16);
    for (let i = 0; i < 16; i++) {
      const payloadByte = payload[i] ?? 0;
      guidBuf[i] = (~(payloadByte ^ XOR_KEY)) & 0xFF;
    }

    return guidBuf.toString('hex');
  }

  static writeGuid (registryPath: string, guidHex: string): void {
    if (guidHex.length !== 32) {
      throw new Error('Invalid GUID length, must be 32 hex chars');
    }
    if (os.platform() !== 'win32') {
      throw new Error('Registry20 encryption is only supported on Windows');
    }

    const guidBytes = Buffer.from(guidHex, 'hex');
    const payload = Buffer.alloc(16);
    for (let i = 0; i < 16; i++) {
      const guidByte = guidBytes[i] ?? 0;
      payload[i] = XOR_KEY ^ (~guidByte & 0xFF);
    }

    const data = Buffer.concat([GUID_HEADER, payload]);

    // Create directory if not exists
    const dir = path.dirname(registryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    dpapiProtectAndWrite(registryPath, data);
  }

  static getBackups (registryPath: string): string[] {
    const dir = path.dirname(registryPath);
    const baseName = path.basename(registryPath);
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir)
      .filter(f => f.startsWith(`${baseName}.bak.`))
      .sort()
      .reverse();
  }

  static backup (registryPath: string): string {
    if (!fs.existsSync(registryPath)) {
      throw new Error('Registry20 does not exist');
    }
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const backupPath = `${registryPath}.bak.${timestamp}`;
    fs.copyFileSync(registryPath, backupPath);
    return backupPath;
  }

  static restore (registryPath: string, backupFileName: string): void {
    const dir = path.dirname(registryPath);
    const backupPath = path.join(dir, backupFileName);
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }
    fs.copyFileSync(backupPath, registryPath);
  }

  static delete (registryPath: string): void {
    if (fs.existsSync(registryPath)) {
      fs.unlinkSync(registryPath);
    }
  }
}

// ============================================================
// Linux machine-info 工具类
// ============================================================

/**
 * ROT13 编解码 (自逆运算)
 * 字母偏移13位，数字和符号不变
 */
function rot13 (s: string): string {
  return s.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

/**
 * Linux 平台 machine-info 文件工具类
 *
 * 文件格式 (逆向自 machine_guid_util.cc):
 *   [4字节 BE uint32 长度 N] [N字节 ROT13 编码的 MAC 字符串]
 *   - MAC 格式: xx-xx-xx-xx-xx-xx (17 字符)
 *   - ROT13: 字母偏移13位, 数字和 '-' 不变
 *
 * GUID 生成算法:
 *   GUID = MD5( /etc/machine-id + MAC地址 )
 */
export class MachineInfoUtils {
  /**
   * 获取 machine-info 文件路径
   */
  static getMachineInfoPath (dataPath: string): string {
    return path.join(dataPath, 'nt_qq', 'global', 'nt_data', 'msf', 'machine-info');
  }

  /**
   * 从 machine-info 文件读取 MAC 地址
   */
  static readMac (machineInfoPath: string): string {
    if (!fs.existsSync(machineInfoPath)) {
      throw new Error('machine-info file not found');
    }

    const data = fs.readFileSync(machineInfoPath);

    if (data.length < 4) {
      throw new Error(`machine-info data too short: ${data.length} < 4 bytes`);
    }

    const length = data.readUInt32BE(0);

    if (length >= 18) {
      throw new Error(`MAC string length abnormal: ${length} >= 18`);
    }

    if (data.length < 4 + length) {
      throw new Error(`machine-info data incomplete: need ${4 + length} bytes, got ${data.length}`);
    }

    const rot13Str = data.subarray(4, 4 + length).toString('ascii');
    return rot13(rot13Str);
  }

  /**
   * 将 MAC 地址写入 machine-info 文件
   */
  static writeMac (machineInfoPath: string, mac: string): void {
    mac = mac.trim().toLowerCase();

    // 验证 MAC 格式: xx-xx-xx-xx-xx-xx
    if (!/^[0-9a-f]{2}(-[0-9a-f]{2}){5}$/.test(mac)) {
      throw new Error('Invalid MAC format, must be xx-xx-xx-xx-xx-xx');
    }

    const encoded = rot13(mac);
    const length = encoded.length;
    const buf = Buffer.alloc(4 + length);
    buf.writeUInt32BE(length, 0);
    buf.write(encoded, 4, 'ascii');

    // 确保目录存在
    const dir = path.dirname(machineInfoPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(machineInfoPath, buf);
  }

  /**
   * 读取 /etc/machine-id
   */
  static readMachineId (): string {
    const machineIdPath = '/etc/machine-id';
    if (!fs.existsSync(machineIdPath)) {
      throw new Error('/etc/machine-id not found');
    }
    return fs.readFileSync(machineIdPath, 'utf-8').trim();
  }

  /**
   * 计算 Linux GUID = MD5(machine-id + MAC)
   */
  static computeGuid (machineId: string, mac: string): string {
    const md5 = crypto.createHash('md5');
    md5.update(machineId, 'ascii');
    md5.update(mac, 'ascii');
    return md5.digest('hex');
  }

  /**
   * 获取备份列表
   */
  static getBackups (machineInfoPath: string): string[] {
    const dir = path.dirname(machineInfoPath);
    const baseName = path.basename(machineInfoPath);
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir)
      .filter(f => f.startsWith(`${baseName}.bak.`))
      .sort()
      .reverse();
  }

  /**
   * 创建备份
   */
  static backup (machineInfoPath: string): string {
    if (!fs.existsSync(machineInfoPath)) {
      throw new Error('machine-info file does not exist');
    }
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const backupPath = `${machineInfoPath}.bak.${timestamp}`;
    fs.copyFileSync(machineInfoPath, backupPath);
    return backupPath;
  }

  /**
   * 恢复备份
   */
  static restore (machineInfoPath: string, backupFileName: string): void {
    const dir = path.dirname(machineInfoPath);
    const backupPath = path.join(dir, backupFileName);
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }
    fs.copyFileSync(backupPath, machineInfoPath);
  }

  /**
   * 删除 machine-info
   */
  static delete (machineInfoPath: string): void {
    if (fs.existsSync(machineInfoPath)) {
      fs.unlinkSync(machineInfoPath);
    }
  }
}
