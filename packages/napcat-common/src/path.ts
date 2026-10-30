import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

export function getQQDataDirOverride (): string | undefined {
  const dataDir = process.env['NAPCAT_QQ_DATA_DIR'];
  return dataDir ? path.resolve(dataDir) : undefined;
}

export class NapCatPathWrapper {
  binaryPath: string;
  logsPath: string;
  configPath: string;
  cachePath: string;
  staticPath: string;
  pluginPath: string;

  constructor (mainPath: string = dirname(fileURLToPath(import.meta.url))) {
    this.binaryPath = mainPath;
    let writePath: string;
    const qqDataDir = getQQDataDirOverride();

    if (process.env['NAPCAT_WORKDIR']) {
      writePath = process.env['NAPCAT_WORKDIR'];
    } else if (qqDataDir) {
      writePath = path.join(qqDataDir, 'NapCat');
    } else if (os.platform() === 'darwin') {
      writePath = path.join(os.homedir(), 'Library', 'Application Support', 'QQ', 'NapCat');
    } else {
      writePath = this.binaryPath;
    }

    this.logsPath = path.join(writePath, 'logs');
    this.configPath = path.join(writePath, 'config');
    this.pluginPath = path.join(writePath, 'plugins');// dynamic load
    this.cachePath = path.join(writePath, 'cache');
    this.staticPath = path.join(this.binaryPath, 'static');
    if (!fs.existsSync(this.logsPath)) {
      fs.mkdirSync(this.logsPath, { recursive: true });
    }
    if (!fs.existsSync(this.configPath)) {
      fs.mkdirSync(this.configPath, { recursive: true });
    }
    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath, { recursive: true });
    }
  }
}
