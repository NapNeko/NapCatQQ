import fs from 'node:fs';
import path from 'node:path';
import { selfInfo } from '@/core/data';
import { logDebug, logError } from '@/common/utils/log';
import { ConfigBase } from '@/common/utils/ConfigBase';

export interface OB11Config {
  httpHost: string;
  httpPort: number;
  httpPostUrls: string[];
  httpSecret: string;
  wsHost: string;
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
  musicSignUrl: string;

  read(): OB11Config;

  save(config: OB11Config): void;
}


class Config extends ConfigBase<OB11Config> implements OB11Config {
  httpHost: string = '';
  httpPort: number = 3000;
  httpPostUrls: string[] = [];
  httpSecret = '';
  wsHost: string = '';
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
  musicSignUrl = '';

  getConfigPath() {
    return path.join(this.getConfigDir(), `onebot11_${selfInfo.uin}.json`);
  }

  protected getKeys(): string[] {
    return ['httpHost', 'enableHttp', 'httpPort', 'wsHost', 'enableWs', 'wsPort', 'enableWsReverse', 'wsReverseUrls', 'enableHttpPost', 'httpPostUrls', 'enableHttpHeart', 'httpSecret', 'messagePostFormat', 'reportSelfMessage', 'debug', 'enableLocalFile2Url', 'heartInterval', 'token', 'musicSignUrl'];
  }
}

export const ob11Config = new Config();
