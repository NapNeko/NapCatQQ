import log4js, { Configuration } from 'log4js';
import { truncateString } from '@/common/utils/helper';
import path from 'node:path';
import { SelfInfo } from '@/core';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

const logDir = path.join(path.resolve(__dirname), 'logs');

function getFormattedTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

const filename = `${getFormattedTimestamp()}.log`;
const logPath = path.join(logDir, filename);

const logConfig: Configuration = {
  appenders: {
    FileAppender: { // 输出到文件的appender
      type: 'file',
      filename: logPath, // 指定日志文件的位置和文件名
      maxLoogSize: 10485760, // 日志文件的最大大小（单位：字节），这里设置为10MB
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p] - %m'
      }
    },
    ConsoleAppender: { // 输出到控制台的appender
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p] - %m'
      }
    }
  },
  categories: {
    default: { appenders: ['FileAppender', 'ConsoleAppender'], level: 'debug' }, // 默认情况下同时输出到文件和控制台
    file: { appenders: ['FileAppender'], level: 'debug' },
    console: { appenders: ['ConsoleAppender'], level: 'debug' }
  }
};

log4js.configure(logConfig);


export function setLogLevel(fileLogLevel: LogLevel, consoleLogLevel: LogLevel) {
  logConfig.categories.file.level = fileLogLevel;
  logConfig.categories.console.level = consoleLogLevel;
  log4js.configure(logConfig);
}

export function setLogSelfInfo(selfInfo: SelfInfo) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  logConfig.appenders.FileAppender.layout.pattern = logConfig.appenders.ConsoleAppender.layout.pattern =
    `%d{yyyy-MM-dd hh:mm:ss} [%p] ${selfInfo.nick}(${selfInfo.uin})  %m`;
  log4js.configure(logConfig);
}

let fileLogEnabled = true;
let consoleLogEnabled = true;
export function enableFileLog(enable: boolean) {
  fileLogEnabled = enable;
}
export function enableConsoleLog(enable: boolean) {
  consoleLogEnabled = enable;
}

function formatMsg(msg: any[]){
  let logMsg = '';
  for (const msgItem of msg) {
    // 判断是否是对象
    if (typeof msgItem === 'object') {
      const obj = JSON.parse(JSON.stringify(msgItem, null, 2));
      logMsg += JSON.stringify(truncateString(obj)) + ' ';
      continue;
    }
    logMsg += msgItem + ' ';
  }
  return '\n' + logMsg + '\n';
}

function _log(level: LogLevel, ...args: any[]){
  if (consoleLogEnabled){
    log4js.getLogger('console')[level](formatMsg(args));
  }
  if (fileLogEnabled){
    log4js.getLogger('file')[level](formatMsg(args));
  }
}

export function log(...args: any[]) {
  // info 等级
  _log(LogLevel.INFO, ...args);
}

export function logDebug(...args: any[]) {
  _log(LogLevel.DEBUG, ...args);
}

export function logError(...args: any[]) {
  _log(LogLevel.ERROR, ...args);
}
