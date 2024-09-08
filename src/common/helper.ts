import path from 'node:path';
import fs from 'fs';
import os from 'node:os';
import { Peer, QQLevel } from '@/core';

export async function solveProblem<T extends (...arg: any[]) => any>(func: T, ...args: Parameters<T>): Promise<ReturnType<T> | undefined> {
    return new Promise<ReturnType<T> | undefined>((resolve) => {
        try {
            const result = func(...args);
            resolve(result);
        } catch (e) {
            resolve(undefined);
        }
    });
}

export async function solveAsyncProblem<T extends (...args: any[]) => Promise<any>>(func: T, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> {
    return new Promise<Awaited<ReturnType<T>> | undefined>((resolve) => {
        func(...args).then((result) => {
            resolve(result);
        }).catch(() => {
            resolve(undefined);
        });
    });
}

export class FileNapCatOneBotUUID {
    static encodeModelId(peer: Peer, modelId: string, fileId: string, endString: string = ""): string {
        let data = `NapCatOneBot|ModelIdFile|${peer.chatType}|${peer.peerUid}|${modelId}|${fileId}`;
        //前四个字节塞data长度
        let length = Buffer.alloc(4 + data.length);
        length.writeUInt32BE(data.length, 0);
        length.write(data, 4);
        return length.toString('hex') + endString;
    }

    static decodeModelId(uuid: string): undefined | {
        peer: Peer,
        modelId: string,
        fileId: string
    } {
        //前四个字节是data长度
        let length = Buffer.from(uuid.slice(0, 8), 'hex').readUInt32BE(0);
        //根据length计算需要读取的长度
        let dataId = uuid.slice(8, 8 + length);
        //hex还原为string
        const realData = Buffer.from(dataId, 'hex').toString();
        if (!realData.startsWith('NapCatOneBot|ModelIdFile|')) return undefined;
        const data = realData.split('|');
        if (data.length !== 6) return undefined;
        const [, , chatType, peerUid, modelId, fileId] = data;
        return {
            peer: {
                chatType: chatType as any,
                peerUid: peerUid,
            },
            modelId,
            fileId
        };
    }

    static encode(peer: Peer, msgId: string, elementId: string, endString: string = ""): string {
        const data = `NapCatOneBot|MsgFile|${peer.chatType}|${peer.peerUid}|${msgId}|${elementId}`;
        //前四个字节塞data长度
        const length = Buffer.alloc(4 + data.length);
        length.writeUInt32BE(data.length, 0);
        length.write(data, 4);
        return length.toString('hex');
    }

    static decode(uuid: string): undefined | {
        peer: Peer,
        msgId: string,
        elementId: string
    } {
        //前四个字节是data长度
        const length = Buffer.from(uuid.slice(0, 8), 'hex').readUInt32BE(0);
        //根据length计算需要读取的长度
        const dataId = uuid.slice(8, 8 + length);
        //hex还原为string
        const realData = Buffer.from(dataId, 'hex').toString();
        if (!realData.startsWith('NapCatOneBot|MsgFile|')) return undefined;
        const data = realData.split('|');
        if (data.length !== 6) return undefined;
        const [, , chatType, peerUid, msgId, elementId] = data;
        return {
            peer: {
                chatType: chatType as any,
                peerUid: peerUid,
            },
            msgId,
            elementId,
        };
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function PromiseTimer<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('PromiseTimer: Operation timed out')), ms),
    );
    return Promise.race([promise, timeoutPromise]);
}

export async function runAllWithTimeout<T>(tasks: Promise<T>[], timeout: number): Promise<T[]> {
    const wrappedTasks = tasks.map((task) =>
        PromiseTimer(task, timeout).then(
            (result) => ({ status: 'fulfilled', value: result }),
            (error) => ({ status: 'rejected', reason: error }),
        ),
    );
    const results = await Promise.all(wrappedTasks);
    return results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as { status: 'fulfilled'; value: T }).value);
}

export function isNull(value: any) {
    return value === undefined || value === null;
}

export function isNumeric(str: string) {
    return /^\d+$/.test(str);
}

export function truncateString(obj: any, maxLength = 500) {
    if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === 'string') {
                // 如果是字符串且超过指定长度，则截断
                if (obj[key].length > maxLength) {
                    obj[key] = obj[key].substring(0, maxLength) + '...';
                }
            } else if (typeof obj[key] === 'object') {
                // 如果是对象或数组，则递归调用
                truncateString(obj[key], maxLength);
            }
        });
    }
    return obj;
}

export function isEqual(obj1: any, obj2: any) {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!isEqual(obj1[key], obj2[key])) return false;
    }
    return true;
}

export function getDefaultQQVersionConfigInfo(): QQVersionConfigType {
    if (os.platform() === 'linux') {
        return {
            baseVersion: '3.2.12-27597',
            curVersion: '3.2.12-27597',
            prevVersion: '',
            onErrorVersions: [],
            buildId: '27597',
        };
    }
    return {
        baseVersion: '9.9.15-27597',
        curVersion: '9.9.15-27597',
        prevVersion: '',
        onErrorVersions: [],
        buildId: '27597',
    };
}

export function getQQPackageInfoPath(exePath: string = ''): string {
    if (os.platform() === 'darwin') {
        return path.join(path.dirname(exePath), '..', 'Resources', 'app', 'package.json');
    } else {
        return path.join(path.dirname(exePath), 'resources', 'app', 'package.json');
    }
}

export function getQQVersionConfigPath(exePath: string = ''): string | undefined {
    let configVersionInfoPath;
    if (os.platform() === 'win32') {
        configVersionInfoPath = path.join(path.dirname(exePath), 'resources', 'app', 'versions', 'config.json');
    } else if (os.platform() === 'darwin') {
        const userPath = os.homedir();
        const appDataPath = path.resolve(userPath, './Library/Application Support/QQ');
        configVersionInfoPath = path.resolve(appDataPath, './versions/config.json');
    } else {
        const userPath = os.homedir();
        const appDataPath = path.resolve(userPath, './.config/QQ');
        configVersionInfoPath = path.resolve(appDataPath, './versions/config.json');
    }
    if (typeof configVersionInfoPath !== 'string') {
        return undefined;
    }
    if (!fs.existsSync(configVersionInfoPath)) {
        return undefined;
    }
    return configVersionInfoPath;
}

export function calcQQLevel(level: QQLevel) {
    const { crownNum, sunNum, moonNum, starNum } = level;
    return crownNum * 64 + sunNum * 16 + moonNum * 4 + starNum;
}
