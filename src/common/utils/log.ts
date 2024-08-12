import log4js, { Configuration } from 'log4js';
import { truncateString } from '@/common/utils/helper';
import path from 'node:path';
import chalk from 'chalk';
import { AtType, ChatType, ElementType, ElementWrapper, RawMessage, SelfInfo } from '@/core';

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

    setFileAndConsoleLogLevel(fileLogLevel: LogLevel, consoleLogLevel: LogLevel) {
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

    setFileLogEnabled(isEnabled: boolean) {
        this.fileLogEnabled = isEnabled;
    }

    setConsoleLogEnabled(isEnabled: boolean) {
        this.consoleLogEnabled = isEnabled;
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

    logMessage(msg: RawMessage, selfInfo: SelfInfo) {
        const isSelfSent = msg.senderUin === selfInfo.uin;
        this.log(`${
            isSelfSent ? '发送 ->' : '接收 <-'
        } ${rawMessageToText(msg)}`);
    }
}

export function rawMessageToText(msg: RawMessage, recursiveLevel = 0): string {
    if (recursiveLevel > 2) {
        return '...';
    }

    const tokens: string[] = [];

    if (msg.chatType == ChatType.friend) {
        tokens.push(`私聊 (${msg.peerUin})`);
    } else if (msg.chatType == ChatType.group) {
        tokens.push(`群聊 (群 ${msg.peerUin} 的 ${msg.senderUin})`);
    } else if (msg.chatType == ChatType.chatDevice) {
        tokens.push('移动设备');
    } else /* temp */ {
        tokens.push(`临时消息 (${msg.peerUin})`);
    }

    // message content

    function msgElementToText(element: ElementWrapper) {
        if (element.textElement) {
            if (element.textElement.atType === AtType.notAt) {
                return element.textElement.content;
            } else if (element.textElement.atType === AtType.atAll) {
                return `@全体成员`;
            } else if (element.textElement.atType === AtType.atUser) {
                return `${element.textElement.content} (${element.textElement.atUid})`;
            }
        }

        if (element.replyElement) {
            const recordMsgOrNull = msg.records.find(
                record => element.replyElement!.sourceMsgIdInRecords === record.msgId
            );
            return `[回复消息 ${
                recordMsgOrNull &&
                recordMsgOrNull.peerUin != '284840486' // 非转发消息; 否则定位不到
                    ? 
                    rawMessageToText(recordMsgOrNull, recursiveLevel + 1) :
                    `未找到消息记录 (MsgId = ${element.replyElement.sourceMsgIdInRecords})`
            }]`;
        }

        if (element.picElement) {
            return `[图片 ${element.picElement.fileName}]`;
        }

        if (element.fileElement) {
            return `[文件 ${element.fileElement.fileName}]`;
        }

        if (element.videoElement) {
            return `[视频 ${element.videoElement.fileName}]`;
        }

        if (element.pttElement) {
            return `[语音 ${element.pttElement.duration}s]`;
        }

        if (element.arkElement) {
            return `[卡片消息 ${element.arkElement.bytesData}]`;
        }

        if (element.faceElement) {
            return `[表情 ${element.faceElement.faceText ?? ''}]`;
        }

        if (element.marketFaceElement) {
            return `[商城表情 ${element.marketFaceElement.faceName}]`;
        }

        if (element.markdownElement) {
            return `[Markdown ${element.markdownElement.content}]`;
        }

        if (element.multiForwardMsgElement) {
            return `[转发消息]`;
        }

        if (element.elementType === ElementType.GreyTip) {
            return `[灰条消息]`; // TODO: resolve the text
        }

        return `[未实现 (ElementType = ${element.elementType})]`;
    }

    for (const element of msg.elements) {
        tokens.push(msgElementToText(element));
    }

    return tokens.join(' ');
}
