import fs from 'node:fs';
import path from 'node:path';
import { selfInfo } from '@/common/data';
import { logDebug, logError } from '@/common/utils/log';
import { ConfigBase } from '@/common/utils/ConfigBase';

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

class Config extends ConfigBase<OB11Config> implements OB11Config {
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

  getConfigPath() {
    return path.join(ob11ConfigDir, `onebot11_${selfInfo.uin}.json`);
  }
}

export const ob11Config = new Config();
