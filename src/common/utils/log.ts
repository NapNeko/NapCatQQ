import log4js from 'log4js';
import { truncateString } from '@/common/utils/helper';
import path from 'node:path';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

const logPath = path.join(path.resolve(__dirname), 'logs', 'napcat.log');

function genLogConfig(fileLogLevel: LogLevel, consoleLogLevel: LogLevel) {
  return {
    appenders: {
      fileAppender: { // 输出到文件的appender
        type: 'file',
        filename: logPath, // 指定日志文件的位置和文件名
        maxLogSize: 10485760, // 日志文件的最大大小（单位：字节），这里设置为10MB
      },
      consoleAppender: { // 输出到控制台的appender
        type: 'console'
      }
    },
    categories: {
      default: { appenders: ['fileAppender', 'consoleAppender'], level: 'debug' }, // 默认情况下同时输出到文件和控制台
      file: { appenders: ['fileAppender'], level: fileLogLevel },
      console: { appenders: ['consoleAppender'], level: consoleLogLevel }
    }
  };
}


export function setLogLevel(fileLogLevel: LogLevel, consoleLogLevel: LogLevel) {
  log4js.configure(genLogConfig(fileLogLevel, consoleLogLevel));
}

setLogLevel(LogLevel.DEBUG, LogLevel.INFO);

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
