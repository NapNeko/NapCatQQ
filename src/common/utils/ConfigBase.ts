import path from 'node:path';
import fs from 'node:fs';
import { logDebug, logError } from '@/common/utils/log';

const configDir = path.resolve(__dirname, 'config');
fs.mkdirSync(configDir, { recursive: true });


export class ConfigBase<T>{

  constructor() {
  }

  getConfigDir(){
    const configDir = path.resolve(__dirname, 'config');
    fs.mkdirSync(configDir, { recursive: true });
    return configDir;
  }
  getConfigPath(): string {
    throw new Error('Method not implemented.');
  }

  read() {
    const configPath = this.getConfigPath();
    if (!fs.existsSync(configPath)) {
      try{
        fs.writeFileSync(configPath, JSON.stringify(this, null, 2));
        logDebug(`配置文件${configPath}已创建, 修改此文件后重启NapCat生效`);
      }
      catch (e: any) {
        logError(`创建配置文件 ${configPath} 时发生错误:`, e.message);
      }
      return this;
    }
    try {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      logDebug(`配置文件${configPath}已加载`, data);
      Object.assign(this, data);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.save(this); // 保存一次，让新版本的字段写入
      return this;
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        logError(`配置文件 ${configPath} 格式错误，请检查配置文件:`, e.message);
      } else {
        logError(`读取配置文件 ${configPath} 时发生错误:`, e.message);
      }
      return this;
    }
  }

  save(config: T) {
    Object.assign(this, config);
    const configPath = this.getConfigPath();
    try {
      fs.writeFileSync(configPath, JSON.stringify(this, null, 2));
    } catch (e: any) {
      logError(`保存配置文件 ${configPath} 时发生错误:`, e.message);
    }
  }
}
