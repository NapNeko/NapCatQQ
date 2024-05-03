import path from 'node:path';
import fs from 'node:fs';
import { log, logDebug, logError } from '@/common/utils/log';

const configDir = path.resolve(__dirname, 'config');
fs.mkdirSync(configDir, { recursive: true });


export class ConfigBase<T>{

  constructor() {
  }

  protected getKeys(): string[] | null {
    // 决定 key 在json配置文件中的顺序
    return null;
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
        fs.writeFileSync(configPath, JSON.stringify(this, this.getKeys(), 2));
        log(`配置文件${configPath}已创建\n如果修改此文件后需要重启 NapCat 生效`);
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
      fs.writeFileSync(configPath, JSON.stringify(this, this.getKeys(), 2));
    } catch (e: any) {
      logError(`保存配置文件 ${configPath} 时发生错误:`, e.message);
    }
  }
}
