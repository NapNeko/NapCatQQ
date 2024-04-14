import path from 'node:path';
import fs from 'node:fs';
import * as log4js from 'log4js';
import * as YAML from 'yaml';
import qrcode from 'qrcode-terminal';
import { NapCatCore, napCatCore } from '@/core';
import { NapCatOnebot11 } from '@/onebot11/main';
import PackageInfo from '@/../package.json';
import { INapCatConfig } from './types';
import { RawMessage } from '@/core/qqnt/entities';

const DefaultNapCatConfig: INapCatConfig = {
  account: {
    uin: '10086',
    password: 'password',
    noQuickLogin: false,
  },
  heartbeat: {
    interval: 5,
  },
  adapters: {
    onebot: {
      address: '0.0.0.0',
      port: 8123,
      accessToken: 'token123456',
    }
  },
  log: {
    level: 'info',
  },
};

function getLog4jConfig(logLevel = 'info', writeFile = false): log4js.Configuration {
  const outputMethod = [ 'console' ];
  if (writeFile) outputMethod.push('file');

  const defaultCategory = {
    appenders: outputMethod,
    level: logLevel,
  };

  return {
    appenders: {
      console: {
        type: 'stdout'
      },
      file: {
        type: 'file',
      },
      ascii: {
        type: 'stdout',
        layout: {
          type: 'pattern',
          pattern: '%[%m%]',
        },
      },
      asciiNoColor: {
        type: 'stdout',
        layout: {
          type: 'pattern',
          pattern: '%m',
        },
      },
    },
    categories: {
      default: defaultCategory,
      ascii: {
        appenders: [ 'ascii' ],
        level: 'info',
      },
      asciiNoColor: {
        appenders: [ 'asciiNoColor' ],
        level: 'info',
      }
    },
  };
}

export class NapCat {
  readonly dataPath: string;
  readonly config: INapCatConfig;

  readonly core: NapCatCore;
  readonly onebot: NapCatOnebot11;

  readonly log: log4js.Logger;
  readonly logMsg: log4js.Logger;

  constructor() {
    // Get data path (usually the same path of NapCat)
    this.dataPath = path.resolve(__dirname, './');

    // Init core
    this.core = napCatCore;
    this.onebot = new NapCatOnebot11();

    // Get user config
    if (!fs.existsSync(path.resolve(this.dataPath, './config.yml'))) { // Detect if no config file exist
      // Use default logger
      log4js.configure(getLog4jConfig('all'));
      this.log = log4js.getLogger('App');
      this.logMsg = log4js.getLogger('Message');
      this.drawBootAscii();

      this.config = DefaultNapCatConfig;
      fs.writeFileSync(path.resolve(this.dataPath, './config.yml'), YAML.stringify(DefaultNapCatConfig));

      this.log.error('未找到配置文件！');
      this.log.error('已为您创建了默认配置文件，请关闭 NapCatQQ 后填写配置文件再启动');
      this.log.error('完整的配置文件详解可前往 [DOC_URL] 查看');

      return;
    }
    this.config = YAML.parse(fs.readFileSync(path.resolve(this.dataPath, './config.yml'), { encoding: 'utf8' }));

    // Apply log4j config before use it
    log4js.configure(getLog4jConfig('all'));
    // log4js.configure(getLog4jConfig(this.config.log.level));
    this.log = log4js.getLogger('App');
    this.logMsg = log4js.getLogger('Message');
    this.drawBootAscii();

    // Init app
    this.initApp();
  }

  // Output ASCII because i love it
  private drawBootAscii() {
    const logAscii = log4js.getLogger('ascii');
    [
      '',
      '   _   _                 _____         _     ____    ____',
      '  | \\ | |               / ____|       | |   / __ \\  / __ \\',
      '  |  \\| |  __ _  _ __  | |       __ _ | |_ | |  | || |  | |',
      '  | . ` | / _` || \'_ \\ | |      / _` || __|| |  | || |  | |',
      '  | |\\  || (_| || |_) || |____ | (_| || |_ | |__| || |__| |',
      '  |_| \\_| \\__,_|| .__/  \\_____| \\__,_| \\__| \\___\\_\\ \\___\\_\\',
      '                | |',
      '                |_|      ',
    ].forEach(i => {
      logAscii.info(i);
    });
    logAscii.info(`---------------------< NapCatQQ v${PackageInfo.version} >---------------------`);
  }

  private initApp() {
    this.core.on('system.login.qrcode', ({ url }: { url: string }) => {
      this.log.info('请扫描下面的二维码，然后在手Q上授权登录：');
      const ascii = log4js.getLogger('asciiNoColor');
      qrcode.generate(url, { small: true }, (res) => {
        ascii.info(res);
      });
    });

    this.core.on('system.login.slider', ({ url }: { url: string }) => {
      this.log.info('登录需要验证，请访问下面的滑块验证链接，然后按下回车：');
      const ascii = log4js.getLogger('asciiNoColor');
      ascii.info(url);
    });

    this.core.on('system.online', () => {
      this.onLoginSuccess();
    });

    this.core.on('system.login.error', ({ code, message }: { code: string, message: string }) => {
      this.log.error(`登录出现问题（${code}）`);
      this.log.error(message);
    });

    if (!this.config.account || !this.config.account.uin) {
      this.log.info('未读取到账号配置，终止初始化...');
      return;
    }

    this.log.info(`正在尝试登录账号 ${this.config.account.uin} ...`);
    if (this.config.account.password) this.core.login.password(this.config.account.uin, this.config.account.password);
    else if (!this.config.account.noQuickLogin) this.core.login.quick(this.config.account.uin);
    else this.core.login.qrcode();
  }

  private onLoginSuccess() {
    this.log.info('登录成功');

    this.core.on('message.private', (e) => {
      this.logMsg.info(`[Private] ${e.peerName}(${e.senderUin}) -> ${msgElementParser(e)}`);
    });
    this.core.on('message.group', (e) => {
      this.logMsg.info(`[Group] ${e.peerName}(${e.peerUin}) - ${e.sendMemberName ? e.sendMemberName : e.sendNickName}(${e.senderUin}) -> ${msgElementParser(e)}`);
    });
  }
}

const msgElementParser = (msg: RawMessage) => {
  let result = '';
  for (const element of msg.elements) {
    if (element.textElement) {
      if (element.textElement.atType === 0) result += element.textElement.content;
      else result += `[@${element.textElement.atType === 2 ? element.textElement.atUid : 'all'}]`;
    }
    if (element.picElement) result += `[Pic=${element.picElement.fileName}]`;
    if (element.pttElement) result += '[Voice]';
    if (element.faceElement) result += `[Face=${element.faceElement.faceIndex}]`;
    if (element.videoElement) result += `[Video=${element.videoElement.fileName}]`;
    if (element.fileElement) result += `[File=${element.fileElement.fileName}]`;
    if (element.marketFaceElement) result += `[MarketFace=${element.marketFaceElement.faceName}]`;
  }
  return result;
};