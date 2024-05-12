import os from 'node:os';
import path from 'node:path';

// 缓解Win7设备兼容性问题
let osName: string;
try {
  osName = os.hostname();
} catch (e) {
  osName = 'NapCat'; // + crypto.randomUUID().substring(0, 4);
}
export const systemPlatform = os.platform();
export const cpuArch = os.arch();
export const systemVersion = os.release();
export const hostname = osName;
const homeDir = os.homedir();
export const downloadsPath = path.join(homeDir, 'Downloads');
export const systemName = os.type();
