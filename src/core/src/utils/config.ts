import path from 'node:path';
import fs from 'node:fs';
import { enableConsoleLog, enableFileLog, logDebug, logError, LogLevel, setLogLevel } from '@/common/utils/log';
import { ConfigBase } from '@/common/utils/ConfigBase';
import { selfInfo } from '@/core/data';


export interface NapCatConfig {
  fileLog: boolean,
  consoleLog: boolean,
  fileLogLevel: LogLevel,
  consoleLogLevel: LogLevel,
}

class Config extends ConfigBase<NapCatConfig> implements NapCatConfig{
  fileLog = true;
  consoleLog = true;
  fileLogLevel  = LogLevel.DEBUG;
  consoleLogLevel  = LogLevel.INFO;

  constructor() {
    super();
  }
  getConfigPath() {
    return path.join(this.getConfigDir(), `napcat_${selfInfo.uin}.json`);
  }
}

export const napCatConfig = new Config();

