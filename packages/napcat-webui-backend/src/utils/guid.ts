import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { protectData, unprotectData } from 'napcat-dpapi';

const GUID_HEADER = Buffer.from([0x00, 0x00, 0x00, 0x14]);
const XOR_KEY = 0x10;

/**
 * 由 QQ 数据根目录推导 global 目录。
 *   Windows: <dataPath>/nt_qq/global
 *   Linux  : <dataPath>/global
 *   macOS  : <dataPath>/global
 */
export function getGlobalDataPath (dataPath: string): string {
  if (os.platform() === 'win32') {
    return path.join(dataPath, 'nt_qq', 'global');
  }
  return path.join(dataPath, 'global');
}

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
    return path.join(getGlobalDataPath(dataPath), 'nt_data', 'msf', 'Registry20');
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
    return path.join(getGlobalDataPath(dataPath), 'nt_data', 'msf', 'machine-info');
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

// ============================================================
// macOS TEA 容器 / machineid-info 工具类
// ============================================================

const TEA_DELTA = 0x9E3779B9;

function teaKeyWords (key: Buffer): [number, number, number, number] {
  const padded = Buffer.concat([key, Buffer.alloc(Math.max(0, 16 - key.length))]).subarray(0, 16);
  return [
    padded.readUInt32BE(0),
    padded.readUInt32BE(4),
    padded.readUInt32BE(8),
    padded.readUInt32BE(12),
  ];
}

/**
 * 单块 TEA 加密 (16 轮, delta 0x9E3779B9, 密钥与数据均按大端处理)
 * 逆向自 macOS wrapper.node sub_4127C1C
 */
export function teaEncryptBlock (block: Buffer, key: Buffer): Buffer {
  if (block.length !== 8) {
    throw new Error('TEA block must be 8 bytes');
  }
  let v0 = block.readUInt32BE(0);
  let v1 = block.readUInt32BE(4);
  const [k0, k1, k2, k3] = teaKeyWords(key);
  let sum = TEA_DELTA;
  for (let i = 0; i < 16; i++) {
    v0 = (v0 + ((((v1 << 4) + k0) ^ (v1 + sum) ^ ((v1 >>> 5) + k1)) >>> 0)) >>> 0;
    v1 = (v1 + ((((v0 << 4) + k2) ^ (v0 + sum) ^ ((v0 >>> 5) + k3)) >>> 0)) >>> 0;
    sum = (sum + TEA_DELTA) >>> 0;
  }
  const out = Buffer.alloc(8);
  out.writeUInt32BE(v0, 0);
  out.writeUInt32BE(v1, 4);
  return out;
}

/**
 * 单块 TEA 解密 -> sub_4127CE5
 */
export function teaDecryptBlock (block: Buffer, key: Buffer): Buffer {
  if (block.length !== 8) {
    throw new Error('TEA block must be 8 bytes');
  }
  let v0 = block.readUInt32BE(0);
  let v1 = block.readUInt32BE(4);
  const [k0, k1, k2, k3] = teaKeyWords(key);
  let sum = (TEA_DELTA * 16) >>> 0;
  for (let i = 0; i < 16; i++) {
    v1 = (v1 - ((((v0 << 4) + k2) ^ (v0 + sum) ^ ((v0 >>> 5) + k3)) >>> 0)) >>> 0;
    v0 = (v0 - ((((v1 << 4) + k0) ^ (v1 + sum) ^ ((v1 >>> 5) + k1)) >>> 0)) >>> 0;
    sum = (sum - TEA_DELTA) >>> 0;
  }
  const out = Buffer.alloc(8);
  out.writeUInt32BE(v0, 0);
  out.writeUInt32BE(v1, 4);
  return out;
}

function xor8 (a: Buffer, b: Buffer): Buffer {
  const out = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) out[i] = a[i]! ^ b[i]!;
  return out;
}

/**
 * QQ 加密容器封装 -> sub_414B658
 *   P_i = X_i XOR C_(i-1)
 *   C_i = E(P_i) XOR P_(i-1)
 *   X   = [head][v8 random][2 random] + payload + 00*7
 */
export function containerEncrypt (payload: Buffer, key: Buffer, rng: (n: number) => Buffer = crypto.randomBytes): Buffer {
  const n = payload.length;
  // 注意: Python 的 % 结果非负, JS 对负数会返回负数, 这里手动取模
  const v8 = ((8 - ((n + 10) % 8)) % 8);
  const head = Buffer.from([(rng(1)[0]! & 0xF8) | v8]);
  const stream = Buffer.concat([head, rng(v8), rng(2), payload, Buffer.alloc(7)]);
  const out = Buffer.alloc(stream.length);
  let pPrev: Buffer = Buffer.alloc(8);
  let cPrev: Buffer = Buffer.alloc(8);
  for (let i = 0; i < stream.length; i += 8) {
    const xI = stream.subarray(i, i + 8);
    const pI = xor8(xI, cPrev);
    const cI = xor8(teaEncryptBlock(pI, key), pPrev);
    cI.copy(out, i);
    pPrev = pI;
    cPrev = cI;
  }
  return out;
}

/**
 * QQ 加密容器解封 -> sub_4128416, 失败返回 null
 */
export function containerDecrypt (data: Buffer, key: Buffer, checkTail = true): Buffer | null {
  if (data.length < 16 || data.length % 8 !== 0) return null;
  const stream = Buffer.alloc(data.length);
  let pPrev: Buffer = Buffer.alloc(8);
  let cPrev: Buffer = Buffer.alloc(8);
  for (let i = 0; i < data.length; i += 8) {
    const cI = data.subarray(i, i + 8);
    const pI = i === 0 ? teaDecryptBlock(cI, key) : teaDecryptBlock(xor8(pPrev, cI), key);
    xor8(pI, cPrev).copy(stream, i);
    pPrev = pI;
    cPrev = cI;
  }
  const v8 = stream[0]! & 0x07;
  const n = data.length - v8 - 10;
  if (n < 0) return null;
  const start = v8 + 3;
  const payload = stream.subarray(start, start + n);
  const tail = stream.subarray(start + n);
  if (checkTail && tail.some((b) => b !== 0)) return null;
  return Buffer.from(payload);
}

function buildFields (...chunks: Buffer[]): Buffer {
  const parts: Buffer[] = [];
  for (const chunk of chunks) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(chunk.length, 0);
    parts.push(len, chunk);
  }
  return Buffer.concat(parts);
}

function parseFields (plain: Buffer): Buffer[] {
  const fields: Buffer[] = [];
  let off = 0;
  while (off + 4 <= plain.length) {
    const len = plain.readUInt32BE(off);
    off += 4;
    if (off + len > plain.length) {
      fields.push(plain.subarray(off));
      break;
    }
    fields.push(plain.subarray(off, off + len));
    off += len;
  }
  return fields;
}

export interface MacMachineInfo {
  machineId: Buffer;
  sn: string;
}

/**
 * macOS machine-info 工具类
 *
 * 文件位置 (相对 QQ global 目录):
 *   nt_data/msf/machineid-info  —— TEA 容器, 明文 = be32(8)+machine_id[8] + be32(len)+sn
 *   nt_data/msf/machine-info    —— 明文 be32(8) + [MAC(6) + 00 00]
 *   nt_data/msf/machine-guid    —— 明文 16 字节 guid
 */
export class MacMachineInfoUtils {
  static getMsfDir (dataPathGlobal: string): string {
    return path.join(dataPathGlobal, 'nt_data', 'msf');
  }

  static getMachineIdInfoPath (dataPathGlobal: string): string {
    return path.join(MacMachineInfoUtils.getMsfDir(dataPathGlobal), 'machineid-info');
  }

  static getMachineInfoPath (dataPathGlobal: string): string {
    return path.join(MacMachineInfoUtils.getMsfDir(dataPathGlobal), 'machine-info');
  }

  static getMachineGuidPath (dataPathGlobal: string): string {
    return path.join(MacMachineInfoUtils.getMsfDir(dataPathGlobal), 'machine-guid');
  }

  /**
   * TEA 密钥 = IOPlatformUUID 字符串前 16 字节 (不足补 0)
   */
  static keyFromUuid (uuid: string): Buffer {
    return Buffer.concat([Buffer.from(uuid, 'utf8').subarray(0, 16), Buffer.alloc(16)]).subarray(0, 16);
  }

  static guidToUuidStyle (guid: Buffer, upper = true): string {
    const s = guid.toString('hex');
    const out = `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
    return upper ? out.toUpperCase() : out;
  }

  static buildMachineIdInfo (machineId: Buffer, sn: string): Buffer {
    if (machineId.length !== 8) {
      throw new Error('machine_id must be 8 bytes');
    }
    return buildFields(machineId, Buffer.from(sn, 'utf8'));
  }

  static parseMachineIdInfo (plain: Buffer): MacMachineInfo {
    const fields = parseFields(plain);
    const machineId = fields[0]?.subarray(0, 8) ?? Buffer.alloc(0);
    const sn = fields[1] ? fields[1].toString('utf8') : '';
    return { machineId: Buffer.from(machineId), sn };
  }

  /**
   * guid = MD5(machine_id[8] || sn)  ->  sub_414E158
   */
  static computeGuid (machineId: Buffer, sn: string): Buffer {
    const md5 = crypto.createHash('md5');
    md5.update(machineId.subarray(0, 8));
    md5.update(sn, 'utf8');
    return md5.digest();
  }

  static readMachineIdInfo (filePath: string, key: Buffer, checkTail = true): MacMachineInfo | null {
    if (!fs.existsSync(filePath)) return null;
    const plain = containerDecrypt(fs.readFileSync(filePath), key, checkTail);
    if (!plain) return null;
    return MacMachineInfoUtils.parseMachineIdInfo(plain);
  }

  static writeMachineIdInfo (filePath: string, machineId: Buffer, sn: string, key: Buffer): void {
    const plain = MacMachineInfoUtils.buildMachineIdInfo(machineId, sn);
    const encrypted = containerEncrypt(plain, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, encrypted);
  }

  /**
   * machine-info 是明文 be32(8) + 8 字节 (MAC(6) + 00 00)
   */
  static readMachineId (filePath: string): Buffer | null {
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath);
    if (data.length < 4) return null;
    const len = data.readUInt32BE(0);
    if (len < 8 || data.length < 4 + len) return null;
    return Buffer.from(data.subarray(4, 4 + 8));
  }

  static readMachineGuid (filePath: string): Buffer | null {
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath);
    if (data.length < 16) return null;
    return Buffer.from(data.subarray(0, 16));
  }

  static getBackups (filePath: string): string[] {
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath);
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir)
      .filter(f => f.startsWith(`${baseName}.bak.`))
      .sort()
      .reverse();
  }

  static backup (filePath: string): string {
    if (!fs.existsSync(filePath)) {
      throw new Error('machineid-info file does not exist');
    }
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const backupPath = `${filePath}.bak.${timestamp}`;
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }

  static restore (filePath: string, backupFileName: string): void {
    const dir = path.dirname(filePath);
    const backupPath = path.join(dir, backupFileName);
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }
    fs.copyFileSync(backupPath, filePath);
  }

  static delete (filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// ============================================================
// macOS 本机硬件读取 (与 wrapper.node 的行为保持一致)
// ============================================================

function ioregProperty (className: string, property: string): string | null {
  try {
    const out = execFileSync('ioreg', ['-rd1', '-c', className], { timeout: 10000, encoding: 'utf8' });
    for (const line of out.split('\n')) {
      if (line.includes(`"${property}"`) && line.includes('=')) {
        return line.split('=')[1]!.trim().replace(/^"|"$/g, '');
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * TEA 密钥来源: IOPlatformUUID
 */
export function getMacPlatformUuid (): string | null {
  return ioregProperty('IOPlatformExpertDevice', 'IOPlatformUUID');
}

/**
 * 序列号回退: IOPlatformSerialNumber
 */
export function getMacSerialNumber (): string | null {
  return ioregProperty('IOPlatformExpertDevice', 'IOPlatformSerialNumber');
}

/**
 * 优先 /dev/disk0 的序列号 (对应 wrapper.node sub_414CD1C)
 */
export function getMacDiskSerial (): string | null {
  try {
    const out = execFileSync('diskutil', ['info', '/dev/disk0'], { timeout: 10000, encoding: 'utf8' });
    for (const line of out.split('\n')) {
      if (line.includes('Serial Number') || line.includes('设备序列号')) {
        return line.split(':').slice(1).join(':').trim();
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * macOS 序列号: 优先 /dev/disk0, 失败回退 IOPlatformSerialNumber
 */
export function getMacSn (): string {
  return getMacDiskSerial() ?? getMacSerialNumber() ?? '';
}

/**
 * 主网卡 MAC: 按 wrapper.node 的逻辑取 IOEthernetInterface 上的 IOMACAddress
 */
export function getMacPrimaryMac (): Buffer | null {
  try {
    const out = execFileSync('ioreg', ['-rd1', '-c', 'IOEthernetInterface'], { timeout: 10000, encoding: 'utf8' });
    for (const line of out.split('\n')) {
      if (line.includes('"IOMACAddress"')) {
        const blob = line.split('=')[1] ?? '';
        const hex = (blob.match(/[0-9a-fA-F]/g) ?? []).join('');
        if (hex.length >= 12) {
          return Buffer.from(hex.slice(0, 12), 'hex');
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}

export interface MacGuidInfo {
  guid: string;
  guidUuid: string;
  machineId: string;
  sn: string;
  mac: string;
  platformUuid: string;
  source: 'machineid-info' | 'mac-fallback';
}

/**
 * 主流程 (对应 wrapper.node GetMachineGuid4MacOS):
 *   guid = MD5(machine_id[8] || sn)
 *   machine_id 优先从 machineid-info (TEA) 读取, 否则回退成 MAC + 00 00
 */
export function computeMacGuidInfo (dataPathGlobal: string, uuidOverride?: string, snOverride?: string): MacGuidInfo {
  const platformUuid = uuidOverride ?? getMacPlatformUuid() ?? '';
  const key = MacMachineInfoUtils.keyFromUuid(platformUuid);
  const sn = snOverride ?? getMacSn();
  const machineIdInfoPath = MacMachineInfoUtils.getMachineIdInfoPath(dataPathGlobal);
  const primaryMac = getMacPrimaryMac();

  let machineId: Buffer | null = null;
  let source: MacGuidInfo['source'] = 'machineid-info';
  let snValue = sn;

  const fromFile = MacMachineInfoUtils.readMachineIdInfo(machineIdInfoPath, key);
  if (fromFile && fromFile.machineId.length === 8) {
    machineId = fromFile.machineId;
    if (!snOverride && fromFile.sn) snValue = fromFile.sn;
  } else {
    const mac = primaryMac;
    if (!mac) {
      throw new Error('Unable to determine machine_id (no machineid-info and no MAC)');
    }
    machineId = Buffer.concat([mac, Buffer.from([0, 0])]);
    source = 'mac-fallback';
  }

  const guid = MacMachineInfoUtils.computeGuid(machineId, snValue);
  return {
    guid: guid.toString('hex'),
    guidUuid: MacMachineInfoUtils.guidToUuidStyle(guid),
    machineId: machineId.toString('hex'),
    sn: snValue,
    mac: primaryMac?.toString('hex') ?? '',
    platformUuid,
    source,
  };
}
