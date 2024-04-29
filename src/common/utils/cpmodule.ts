import * as os from 'os';
import path from 'node:path';
import fs from 'fs';

export function getModuleWithArchName(moduleName: string) {
  const systemPlatform = os.platform;
  const cpuArch = os.arch;
  return `${moduleName}-${systemPlatform}-${cpuArch}.node`;
}

export function cpModule(moduleName: string) {
  const currentDir = path.resolve(__dirname);
  const fileName = `./${getModuleWithArchName(moduleName)}`;
  try {
    fs.copyFileSync(path.join(currentDir, fileName), path.join(currentDir, `${moduleName}.node`));
  } catch (e) {

  }
}
