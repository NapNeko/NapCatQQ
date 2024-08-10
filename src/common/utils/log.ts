import log4js, { Configuration } from 'log4js';
import { truncateString } from '@/common/utils/helper';
import path from 'node:path';
import chalk from 'chalk';
import { OB11Message } from '@/onebot';
import { Group, NapCatCore } from '@/core';

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal',
}

function getFormattedTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}.${milliseconds}`;
}

const spSegColor = chalk.blue;// for special segment
const spColor = chalk.cyan;// for special

export class LogWrapper {
    fileLogEnabled = true;
    consoleLogEnabled = true;
    logConfig: Configuration;
    loggerConsole: log4js.Logger;
    loggerFile: log4js.Logger;
    loggerDefault: log4js.Logger;
    // eslint-disable-next-line no-control-regex
    colorEscape = /\x1B[@-_][0-?]*[ -/]*[@-~]/g;

    constructor(logDir: string) {
        // logDir = path.join(path.resolve(__dirname), 'logs');
        const filename = `${getFormattedTimestamp()}.log`;
        const logPath = path.join(logDir, filename);
        this.logConfig = {
            appenders: {
                FileAppender: { // 输出到文件的appender
                    type: 'file',
                    filename: logPath, // 指定日志文件的位置和文件名
                    maxLogSize: 10485760, // 日志文件的最大大小（单位：字节），这里设置为10MB
                    layout: {
                        type: 'pattern',
                        pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p] %X{userInfo} | %m',
                    },
                },
                ConsoleAppender: { // 输出到控制台的appender
                    type: 'console',
                    layout: {
                        type: 'pattern',
                        pattern: `%d{yyyy-MM-dd hh:mm:ss} [%[%p%]] ${chalk.magenta('%X{userInfo}')} | %m`,
                    },
                },
            },
            categories: {
                default: { appenders: ['FileAppender', 'ConsoleAppender'], level: 'debug' }, // 默认情况下同时输出到文件和控制台
                file: { appenders: ['FileAppender'], level: 'debug' },
                console: { appenders: ['ConsoleAppender'], level: 'debug' },
            },
        };
        log4js.configure(this.logConfig);
        this.loggerConsole = log4js.getLogger('console');
        this.loggerFile = log4js.getLogger('file');
        this.loggerDefault = log4js.getLogger('default');
        this.setLogSelfInfo({ nick: '', uin: '', uid: '' });
    }

    setLogLevel(fileLogLevel: LogLevel, consoleLogLevel: LogLevel) {
        this.logConfig.categories.file.level = fileLogLevel;
        this.logConfig.categories.console.level = consoleLogLevel;
        log4js.configure(this.logConfig);
    }

    setLogSelfInfo(selfInfo: { nick: string, uin: string, uid: string }) {
        const userInfo = `${selfInfo.nick}(${selfInfo.uin})`;
        this.loggerConsole.addContext('userInfo', userInfo);
        this.loggerFile.addContext('userInfo', userInfo);
        this.loggerDefault.addContext('userInfo', userInfo);
    }


    enableFileLog(enable: boolean) {
        this.fileLogEnabled = enable;
    }

    enableConsoleLog(enable: boolean) {
        this.consoleLogEnabled = enable;
    }

    formatMsg(msg: any[]) {
        let logMsg = '';
        for (const msgItem of msg) {
            if (msgItem instanceof Error) { // 判断是否是错误
                logMsg += msgItem.stack + ' ';
                continue;
            } else if (typeof msgItem === 'object') { // 判断是否是对象
                const obj = JSON.parse(JSON.stringify(msgItem, null, 2));
                logMsg += JSON.stringify(truncateString(obj)) + ' ';
                continue;
            }
            logMsg += msgItem + ' ';
        }
        return logMsg;
    }


    _log(level: LogLevel, ...args: any[]) {
        if (this.consoleLogEnabled) {
            this.loggerConsole[level](this.formatMsg(args));
        }
        if (this.fileLogEnabled) {
            this.loggerFile[level](this.formatMsg(args).replace(this.colorEscape, ''));
        }
    }

    log(...args: any[]) {
        // info 等级
        this._log(LogLevel.INFO, ...args);
    }

    logDebug(...args: any[]) {
        this._log(LogLevel.DEBUG, ...args);
    }

    logError(...args: any[]) {
        this._log(LogLevel.ERROR, ...args);
    }

    logWarn(...args: any[]) {
        this._log(LogLevel.WARN, ...args);
    }

    logFatal(...args: any[]) {
        this._log(LogLevel.FATAL, ...args);
    }

    async logMessage(ob11Message: OB11Message, core: NapCatCore) {
        const isSelfSent = ob11Message.sender.user_id.toString() === core.selfInfo.uin;
        let prefix = '';
        let group: Group | undefined;
        if (isSelfSent) {
            prefix = '发送消息 ';
            if (ob11Message.message_type === 'private') {
                prefix += '给私聊 ';
                prefix += `${ob11Message.target_id}`;
            }
            else {
                prefix += '给群聊 ';
            }
        }
        if (ob11Message.message_type === 'group') {
            if (ob11Message.group_id == 284840486) {
                group = await core.ApiContext.GroupApi.getGroup(ob11Message.group_id.toString());
                prefix += '转发消息[外部来源] ';
            } else {
                group = await core.ApiContext.GroupApi.getGroup(ob11Message.group_id!.toString());
                prefix += `群[${group?.groupName}(${ob11Message.group_id})] `;
            }
        }
        let msgChain = '';
        if (Array.isArray(ob11Message.message)) {
            const msgParts = [];
            for (const segment of ob11Message.message) {
                if (segment.type === 'text') {
                    msgParts.push(segment.data.text);
                }
                else if (segment.type === 'at') {
                    const groupMember = await core.ApiContext.GroupApi.getGroupMember(ob11Message.group_id!, segment.data.qq!);
                    msgParts.push(spSegColor(`[@${groupMember?.cardName || groupMember?.nick}(${segment.data.qq})]`));
                }
                else if (segment.type === 'reply') {
                    msgParts.push(spSegColor(`[回复消息|id:${segment.data.id}]`));
                }
                else if (segment.type === 'image') {
                    msgParts.push(spSegColor(`[图片|${segment.data.url}]`));
                }
                else if (segment.type === 'face') {
                    msgParts.push(spSegColor(`[表情|id:${segment.data.id}]`));
                }
                else if (segment.type === 'mface') {
                    // @ts-expect-error 商城表情 url
                    msgParts.push(spSegColor(`[商城表情|${segment.data.url}]`));
                }
                else if (segment.type === 'record') {
                    msgParts.push(spSegColor(`[语音|${segment.data.file}]`));
                }
                else if (segment.type === 'file') {
                    msgParts.push(spSegColor(`[文件|${segment.data.file}]`));
                }
                else if (segment.type === 'json') {
                    msgParts.push(spSegColor(`[json|${JSON.stringify(segment.data)}]`));
                }
                else if (segment.type === 'markdown') {
                    msgParts.push(spSegColor(`[markdown|${segment.data.content}]`));
                }
                else if (segment.type === 'video') {
                    msgParts.push(spSegColor(`[视频|${segment.data.url}]`));
                }
                else if (segment.type === 'forward') {
                    msgParts.push(spSegColor(`[转发|${segment.data.id}|消息开始]`));
                    segment.data.content.forEach((msg) => {
                        this.logMessage(msg, core);
                    });
                    msgParts.push(spSegColor(`[转发|${segment.data.id}|消息结束]`));
                }
                else {
                    msgParts.push(spSegColor(`[未实现|${JSON.stringify(segment)}]`));
                }
            }
            msgChain = msgParts.join(' ');
        }
        else {
            msgChain = ob11Message.message;
        }
        let msgString = `${prefix}${ob11Message.sender.nickname}(${ob11Message.sender.user_id}): ${msgChain}`;
        if (isSelfSent) {
            msgString = `${prefix}: ${msgChain}`;
        }
        this.log(msgString);
    }
}
