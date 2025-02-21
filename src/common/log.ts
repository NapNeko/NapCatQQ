/* eslint-disable @typescript-eslint/no-explicit-any */
import winston, { format, transports } from 'winston';
import { truncateString } from '@/common/helper';
import path from 'node:path';
import fs from 'node:fs/promises';
import { NTMsgAtType, ChatType, ElementType, MessageElement, RawMessage, SelfInfo } from '@/core';
import EventEmitter from 'node:events';
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

const logEmitter = new EventEmitter();
export type LogListener = (msg: string) => void;
class Subscription {
    public static MAX_HISTORY = 100;
    public static history: string[] = [];

    subscribe(listener: LogListener) {
        for (const history of Subscription.history) {
            try {
                listener(history);
            } catch {
                // ignore
            }
        }
        logEmitter.on('log', listener);
    }
    unsubscribe(listener: LogListener) {
        logEmitter.off('log', listener);
    }
    notify(msg: string) {
        logEmitter.emit('log', msg);
        if (Subscription.history.length >= Subscription.MAX_HISTORY) {
            Subscription.history.shift();
        }
        Subscription.history.push(msg);
    }
}

export const logSubscription = new Subscription();

export class LogWrapper {
    fileLogEnabled = true;
    consoleLogEnabled = true;
    logger: winston.Logger;

    constructor(logDir: string) {
        const filename = `${getFormattedTimestamp()}.log`;
        const logPath = path.join(logDir, filename);

        this.logger = winston.createLogger({
            level: 'debug',
            format: format.combine(
                format.timestamp({ format: 'MM-DD HH:mm:ss' }),
                format.printf(({ timestamp, level, message, ...meta }) => {
                    const userInfo = meta['userInfo'] ? `${meta['userInfo']} | ` : '';
                    return `${timestamp} [${level}] ${userInfo}${message}`;
                })
            ),
            transports: [
                new transports.File({
                    filename: logPath,
                    level: 'debug',
                    maxsize: 5 * 1024 * 1024, // 5MB
                    maxFiles: 5,
                }),
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.printf(({ timestamp, level, message, ...meta }) => {
                            const userInfo = meta['userInfo'] ? `${meta['userInfo']} | ` : '';
                            return `${timestamp} [${level}] ${userInfo}${message}`;
                        })
                    ),
                }),
            ],
        });

        this.setLogSelfInfo({ nick: '', uid: '' });
        this.cleanOldLogs(logDir);
    }

    cleanOldLogs(logDir: string) {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        fs.readdir(logDir).then((files) => {
            files.forEach((file) => {
                const filePath = path.join(logDir, file);
                this.deleteOldLogFile(filePath, oneWeekAgo);
            });
        }).catch((err) => {
            this.logger.error('Failed to read log directory', err);
        });
    }

    private deleteOldLogFile(filePath: string, oneWeekAgo: number) {
        fs.stat(filePath).then((stats) => {
            if (stats.mtime.getTime() < oneWeekAgo) {
                fs.unlink(filePath).catch((err) => {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            this.logger.warn(`File already deleted: ${filePath}`);
                        } else {
                            this.logger.error('Failed to delete old log file', err);
                        }
                    } else {
                        this.logger.info(`Deleted old log file: ${filePath}`);
                    }
                });
            }
        }).catch((err) => {
            this.logger.error('Failed to get file stats', err);
        });
    }

    setFileAndConsoleLogLevel(fileLogLevel: LogLevel, consoleLogLevel: LogLevel) {
        this.logger.transports.forEach((transport) => {
            if (transport instanceof transports.File) {
                transport.level = fileLogLevel;
            } else if (transport instanceof transports.Console) {
                transport.level = consoleLogLevel;
            }
        });
    }

    setLogSelfInfo(selfInfo: { nick: string; uid: string }) {
        const userInfo = `${selfInfo.nick}`;
        this.logger.defaultMeta = { userInfo };
    }

    setFileLogEnabled(isEnabled: boolean) {
        this.fileLogEnabled = isEnabled;
        this.logger.transports.forEach((transport) => {
            if (transport instanceof transports.File) {
                transport.silent = !isEnabled;
            }
        });
    }

    setConsoleLogEnabled(isEnabled: boolean) {
        this.consoleLogEnabled = isEnabled;
        this.logger.transports.forEach((transport) => {
            if (transport instanceof transports.Console) {
                transport.silent = !isEnabled;
            }
        });
    }

    formatMsg(msg: any[]) {
        return msg
            .map((msgItem) => {
                if (msgItem instanceof Error) {
                    return msgItem.stack;
                } else if (typeof msgItem === 'object') {
                    return JSON.stringify(truncateString(JSON.parse(JSON.stringify(msgItem, null, 2))));
                }
                return msgItem;
            })
            .join(' ');
    }

    _log(level: LogLevel, ...args: any[]) {
        const message = this.formatMsg(args);
        if (this.consoleLogEnabled && this.fileLogEnabled) {
            this.logger.log(level, message);
        } else if (this.consoleLogEnabled) {
            this.logger.log(level, message);
        } else if (this.fileLogEnabled) {
            // eslint-disable-next-line no-control-regex
            this.logger.log(level, message.replace(/\x1B[@-_][0-?]*[ -/]*[@-~]/g, ''));
        }
        logSubscription.notify(JSON.stringify({ level, message }));
    }

    log(...args: any[]) {
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

        if (msg.elements[0]?.elementType === ElementType.GreyTip) {
            return;
        }

        this.log(`${isSelfSent ? '发送 ->' : '接收 <-'} ${rawMessageToText(msg)}`);
    }
}

export function rawMessageToText(msg: RawMessage, recursiveLevel = 0): string {
    if (recursiveLevel > 2) {
        return '...';
    }

    const tokens: string[] = [];

    if (msg.chatType == ChatType.KCHATTYPEC2C) {
        tokens.push(`私聊 (${msg.peerUin})`);
    } else if (msg.chatType == ChatType.KCHATTYPEGROUP) {
        if (recursiveLevel < 1) {
            tokens.push(`群聊 [${msg.peerName}(${msg.peerUin})]`);
        }
        if (msg.senderUin !== '0') {
            tokens.push(`[${msg.sendMemberName || msg.sendRemarkName || msg.sendNickName}(${msg.senderUin})]`);
        }
    } else if (msg.chatType == ChatType.KCHATTYPEDATALINE) {
        tokens.push('移动设备');
    } else {
        tokens.push(`临时消息 (${msg.peerUin})`);
    }

    for (const element of msg.elements) {
        tokens.push(msgElementToText(element, msg, recursiveLevel));
    }

    return tokens.join(' ');
}

function msgElementToText(element: MessageElement, msg: RawMessage, recursiveLevel: number): string {
    if (element.textElement) {
        return textElementToText(element.textElement);
    }

    if (element.replyElement) {
        return replyElementToText(element.replyElement, msg, recursiveLevel);
    }

    if (element.picElement) {
        return '[图片]';
    }

    if (element.fileElement) {
        return `[文件 ${element.fileElement.fileName}]`;
    }

    if (element.videoElement) {
        return '[视频]';
    }

    if (element.pttElement) {
        return `[语音 ${element.pttElement.duration}s]`;
    }

    if (element.arkElement) {
        return '[卡片消息]';
    }

    if (element.faceElement) {
        return `[表情 ${element.faceElement.faceText ?? ''}]`;
    }

    if (element.marketFaceElement) {
        return element.marketFaceElement.faceName;
    }

    if (element.markdownElement) {
        return '[Markdown 消息]';
    }

    if (element.multiForwardMsgElement) {
        return '[转发消息]';
    }

    if (element.elementType === ElementType.GreyTip) {
        return '[灰条消息]';
    }

    return `[未实现 (ElementType = ${element.elementType})]`;
}

function textElementToText(textElement: any): string {
    if (textElement.atType === NTMsgAtType.ATTYPEUNKNOWN) {
        const originalContentLines = textElement.content.split('\n');
        return `${originalContentLines[0]}${originalContentLines.length > 1 ? ' ...' : ''}`;
    } else if (textElement.atType === NTMsgAtType.ATTYPEALL) {
        return '@全体成员';
    } else if (textElement.atType === NTMsgAtType.ATTYPEONE) {
        return `${textElement.content} (${textElement.atUid})`;
    }
    return '';
}

function replyElementToText(replyElement: any, msg: RawMessage, recursiveLevel: number): string {
    const recordMsgOrNull = msg.records.find((record) => replyElement.sourceMsgIdInRecords === record.msgId);
    return `[回复消息 ${recordMsgOrNull && recordMsgOrNull.peerUin != '284840486' && recordMsgOrNull.peerUin != '1094950020'
        ? rawMessageToText(recordMsgOrNull, recursiveLevel + 1)
        : `未找到消息记录 (MsgId = ${replyElement.sourceMsgIdInRecords})`
    }]`;
}
