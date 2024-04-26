import fs from 'node:fs';
import path from 'node:path';
import { selfInfo } from '@/common/data';
import { logDebug, logError } from '@/common/utils/log';

export interface OB11Config {
  httpPort: number;
  httpPostUrls: string[];
  httpSecret: string;
  wsPort: number;
  wsReverseUrls: string[];
  enableHttp: boolean;
  enableHttpHeart: boolean;
  enableHttpPost: boolean;
  enableWs: boolean;
  enableWsReverse: boolean;
  messagePostFormat: 'array' | 'string';
  reportSelfMessage: boolean;
  enableLocalFile2Url: boolean;
  debug: boolean;
  heartInterval: number;
  token: string;

  read(): OB11Config;

  save(config: OB11Config): void;
}

const ob11ConfigDir = path.resolve(__dirname, 'config');
fs.mkdirSync(ob11ConfigDir, { recursive: true });

class Config implements OB11Config {
  httpPort: number = 3000;
  httpPostUrls: string[] = [];
  httpSecret = '';
  wsPort = 3001;
  wsReverseUrls: string[] = [];
  enableHttp = false;
  enableHttpPost = false;
  enableHttpHeart = false;
  enableWs = false;
  enableWsReverse = false;
  messagePostFormat: 'array' | 'string' = 'array';
  reportSelfMessage = false;
  debug = false;
  enableLocalFile2Url = true;
  heartInterval = 30000;
  token = '';

  constructor() {
  }

  getConfigPath() {
    return path.join(ob11ConfigDir, `onebot11_${selfInfo.uin}.json`);
  }

  read() {
    const ob11ConfigPath = this.getConfigPath();
    if (!fs.existsSync(ob11ConfigPath)) {
      logError(`onebot11配置文件 ${ob11ConfigPath} 不存在, 现已创建，请修改配置文件后重启NapCat`);
      this.save();
      return this;
    }
    const data = fs.readFileSync(ob11ConfigPath, 'utf-8');
    try {
      const jsonData = JSON.parse(data);
      logDebug('Onebot 11配置文件已加载', jsonData);
      Object.assign(this, jsonData);
      // eslint-disable-next-line
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        logError(`配置文件 ${ob11ConfigPath} 格式错误，请检查配置文件:`, e.message);
      }else{
        logError(`读取配置文件 ${ob11ConfigPath} 时发生错误:`, e.message);
      }
    }
    return this;
  }

  save(newConfig: OB11Config | null = null) {
    if (newConfig) {
      Object.assign(this, newConfig);
    }
    fs.writeFileSync(this.getConfigPath(), JSON.stringify(this, null, 4));
  }
}

export const ob11Config = new Config();
