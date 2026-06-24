import os from 'node:os';
import path from 'node:path';

// 缓解Win7设备兼容性问题
let osName: string;

try {
  osName = os.hostname();
} catch {
  osName = 'DESKTOP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

const homeDir = os.homedir();

export const systemPlatform = os.platform();
export const cpuArch = os.arch();
export const systemVersion = os.release();
export const hostname = osName;
export const downloadsPath = path.join(homeDir, 'Downloads');
export const systemName = os.type();
