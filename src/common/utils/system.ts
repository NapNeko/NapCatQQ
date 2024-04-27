import os from 'node:os';
import path from 'node:path';

export const systemPlatform = os.platform();
export const cpuArch = os.arch();
export const systemVersion = os.release();
export const hostname = os.hostname();
const homeDir = os.homedir();
export const downloadsPath = path.join(homeDir, 'Downloads');
export const systemName = os.type();
