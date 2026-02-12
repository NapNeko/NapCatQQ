import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
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
