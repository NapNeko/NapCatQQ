/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'node:path';
import fs from 'fs';
import os from 'node:os';
import { QQLevel } from '@/core';
import { QQVersionConfigType } from './types';

export async function solveProblem<T extends (...arg: any[]) => any>(func: T, ...args: Parameters<T>): Promise<ReturnType<T> | undefined> {
    return new Promise<ReturnType<T> | undefined>((resolve) => {
        try {
            const result = func(...args);
            resolve(result);
        } catch {
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
            baseVersion: '3.2.12.28060',
            curVersion: '3.2.12.28060',
            prevVersion: '',
            onErrorVersions: [],
            buildId: '27254',
        };
    }
    if (os.platform() === 'darwin') {
        return {
            baseVersion: '6.9.53.28060',
            curVersion: '6.9.53.28060',
            prevVersion: '',
            onErrorVersions: [],
            buildId: '28060',
        };
    }
    return {
        baseVersion: '9.9.15-28131',
        curVersion: '9.9.15-28131',
        prevVersion: '',
        onErrorVersions: [],
        buildId: '28131',
    };
}

export function getQQPackageInfoPath(exePath: string = '', version?: string): string {
    let packagePath;
    if (os.platform() === 'darwin') {
        packagePath = path.join(path.dirname(exePath), '..', 'Resources', 'app', 'package.json');
    } else if (os.platform() === 'linux') {
        packagePath = path.join(path.dirname(exePath), './resources/app/package.json');
    } else {
        packagePath = path.join(path.dirname(exePath), './versions/' + version + '/resources/app/package.json');
    }
    //下面是老版本兼容 未来去掉
    if (!fs.existsSync(packagePath)) {
        packagePath = path.join(path.dirname(exePath), './resources/app/versions/' + version + '/package.json');
    }
    return packagePath;
}

export function getQQVersionConfigPath(exePath: string = ''): string | undefined {
    let configVersionInfoPath;
    if (os.platform() === 'win32') {
        configVersionInfoPath = path.join(path.dirname(exePath), 'versions', 'config.json');
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
    //老版本兼容 未来去掉
    if (!fs.existsSync(configVersionInfoPath)) {
        configVersionInfoPath = path.join(path.dirname(exePath), './resources/app/versions/config.json');
    }
    if (!fs.existsSync(configVersionInfoPath)) {
        return undefined;
    }
    return configVersionInfoPath;
}

export function calcQQLevel(level?: QQLevel) {
    if (!level) return 0;
    const { crownNum, sunNum, moonNum, starNum } = level;
    return crownNum * 64 + sunNum * 16 + moonNum * 4 + starNum;
}

export function stringifyWithBigInt(obj: any) {
    return JSON.stringify(obj, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    );
}

export function parseAppidFromMajor(nodeMajor: string): string | undefined {
    const hexSequence = 'A4 09 00 00 00 35';
    const sequenceBytes = Buffer.from(hexSequence.replace(/ /g, ''), 'hex');
    const filePath = path.resolve(nodeMajor);
    const fileContent = fs.readFileSync(filePath);

    let searchPosition = 0;
    while (true) {
        const index = fileContent.indexOf(sequenceBytes, searchPosition);
        if (index === -1) {
            break;
        }

        const start = index + sequenceBytes.length - 1;
        const end = fileContent.indexOf(0x00, start);
        if (end === -1) {
            break;
        }
        const content = fileContent.subarray(start, end);
        if (!content.every(byte => byte === 0x00)) {
            try {
                return content.toString('utf-8');
            } catch {
                break;
            }
        }

        searchPosition = end + 1;
    }

    return undefined;
}