import fs from 'fs';
import { stat } from 'fs/promises';
import crypto, { randomUUID } from 'crypto';
import util from 'util';
import path from 'node:path';
import * as fileType from 'file-type';
import { solveProblem } from './helper';

export function isGIF(path: string) {
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(path, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);
    return buffer.toString() === 'GIF8';
}

// 定义一个异步函数来检查文件是否存在
export function checkFileReceived(path: string, timeout: number = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        function check() {
            if (fs.existsSync(path)) {
                resolve();
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`文件不存在: ${path}`));
            } else {
                setTimeout(check, 100);
            }
        }

        check();
    });
}

// 定义一个异步函数来检查文件是否存在
export async function checkFileReceived2(path: string, timeout: number = 3000): Promise<void> {
    // 使用 Promise.race 来同时进行文件状态检查和超时计时
    // Promise.race 会返回第一个解决（resolve）或拒绝（reject）的 Promise
    await Promise.race([
        checkFile(path),
        timeoutPromise(timeout, `文件不存在: ${path}`),
    ]);
}

// 转换超时时间至 Promise
function timeoutPromise(timeout: number, errorMsg: string): Promise<void> {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(errorMsg));
        }, timeout);
    });
}

// 异步检查文件是否存在
async function checkFile(path: string): Promise<void> {
    try {
        await stat(path);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // 如果文件不存在，则抛出一个错误
            throw new Error(`文件不存在: ${path}`);
        } else {
            // 对于 stat 调用的其他错误，重新抛出
            throw error;
        }
    }
    // 如果文件存在，则无需做任何事情，Promise 解决（resolve）自身
}

export async function file2base64(path: string) {
    const readFile = util.promisify(fs.readFile);
    const result = {
        err: '',
        data: '',
    };
    try {
        // 读取文件内容
        // if (!fs.existsSync(path)){
        //     path = path.replace("\\Ori\\", "\\Thumb\\");
        // }
        try {
            await checkFileReceived(path, 5000);
        } catch (e: any) {
            result.err = e.toString();
            return result;
        }
        const data = await readFile(path);
        // 转换为Base64编码
        result.data = data.toString('base64');
    } catch (err: any) {
        result.err = err.toString();
    }
    return result;
}

export function calculateFileMD5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // 创建一个流式读取器
        const stream = fs.createReadStream(filePath);
        const hash = crypto.createHash('md5');

        stream.on('data', (data: Buffer) => {
            // 当读取到数据时，更新哈希对象的状态
            hash.update(data);
        });

        stream.on('end', () => {
            // 文件读取完成，计算哈希
            const md5 = hash.digest('hex');
            resolve(md5);
        });

        stream.on('error', (err: Error) => {
            // 处理可能的读取错误
            reject(err);
        });
    });
}

export interface HttpDownloadOptions {
    url: string;
    headers?: Record<string, string> | string;
}

export async function httpDownload(options: string | HttpDownloadOptions): Promise<Buffer> {
    // const chunks: Buffer[] = [];
    let url: string;
    let headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36',
    };
    if (typeof options === 'string') {
        url = options;
        headers['Host'] = new URL(url).hostname;
    } else {
        url = options.url;
        if (options.headers) {
            if (typeof options.headers === 'string') {
                headers = JSON.parse(options.headers);
            } else {
                headers = options.headers;
            }
        }
    }
    const fetchRes = await fetch(url, { headers }).catch((err) => {
        if (err.cause) {
            throw err.cause;
        }
        throw err;
    });
    if (!fetchRes.ok) throw new Error(`下载文件失败: ${fetchRes.statusText}`);

    const blob = await fetchRes.blob();
    const buffer = await blob.arrayBuffer();
    return Buffer.from(buffer);
}

type Uri2LocalRes = {
    success: boolean,
    errMsg: string,
    fileName: string,
    ext: string,
    path: string,
    isLocal: boolean
}

export async function checkFileV2(filePath: string) {
    try {
        const ext: string | undefined = (await fileType.fileTypeFromFile(filePath))?.ext;
        if (ext) {
            fs.renameSync(filePath, filePath + `.${ext}`);
            filePath += `.${ext}`;
            return { success: true, ext: ext, path: filePath };
        }
    } catch (e) {
        // log("获取文件类型失败", filePath,e.stack)
    }
    return { success: false, ext: '', path: filePath };
}

export enum FileUriType {
    Unknown = 0,
    Local = 1,
    Remote = 2,
    Base64 = 3
}

export async function checkUriType(Uri: string) {

    const LocalFileRet = await solveProblem((uri: string) => {
        if (fs.existsSync(uri)) {
            return { Uri: uri, Type: FileUriType.Local };
        }
        return undefined;
    }, Uri);
    if (LocalFileRet) return LocalFileRet;

    const OtherFileRet = await solveProblem((uri: string) => {
        //再判断是否是Http
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
            return { Uri: uri, Type: FileUriType.Remote };
        }
        //再判断是否是Base64
        if (uri.startsWith('base64://')) {
            return { Uri: uri, Type: FileUriType.Base64 };
        }
        if (uri.startsWith('file://')) {
            let filePath: string;
            // await fs.copyFile(url.pathname, filePath);
            const pathname = decodeURIComponent(new URL(uri).pathname);
            if (process.platform === 'win32') {
                filePath = pathname.slice(1);
            } else {
                filePath = pathname;
            }
            return { Uri: filePath, Type: FileUriType.Local };
        }
        if (uri.startsWith('data:')) {
            let data = uri.split(',')[1];
            if (data) return { Uri: data, Type: FileUriType.Base64 };
        }
    }, Uri);
    if (OtherFileRet) return OtherFileRet;

    return { Uri: Uri, Type: FileUriType.Unknown };
}

export async function uri2local(dir: string, uri: string, filename: string | undefined = undefined): Promise<Uri2LocalRes> {
    const { Uri: HandledUri, Type: UriType } = await checkUriType(uri);
    //解析失败

    if (UriType == FileUriType.Unknown) {
        return { success: false, errMsg: '未知文件类型', fileName: '', ext: '', path: '', isLocal: false };
    }
    //解析File协议和本地文件
    if (UriType == FileUriType.Local) {
        const fileExt = path.extname(HandledUri);
        let filename = path.basename(HandledUri, fileExt);
        filename += fileExt;
        return { success: true, errMsg: '', fileName: filename, ext: fileExt, path: HandledUri, isLocal: true };
    }
    //接下来都要有文件名
    if (!filename) filename = randomUUID();
    //解析Http和Https协议

    if (UriType == FileUriType.Remote) {
        const pathInfo = path.parse(decodeURIComponent(new URL(HandledUri).pathname));
        if (pathInfo.name) {
            filename = pathInfo.name;
            if (pathInfo.ext) {
                filename += pathInfo.ext;
            }
        }
        filename = filename.replace(/[/\\:*?"<>|]/g, '_');
        const fileExt = path.extname(HandledUri);
        const filePath = path.join(dir, filename);
        const buffer = await httpDownload(HandledUri);
        fs.writeFileSync(filePath, buffer);
        return { success: true, errMsg: '', fileName: filename, ext: fileExt, path: filePath, isLocal: false };
    }
    //解析Base64
    if (UriType == FileUriType.Base64) {
        const base64 = HandledUri.replace(/^base64:\/\//, '');
        const buffer = Buffer.from(base64, 'base64');
        let filePath = path.join(dir, filename);
        let fileExt = '';
        fs.writeFileSync(filePath, buffer);
        const { success, ext, path: fileTypePath } = await checkFileV2(filePath);
        if (success) {
            filePath = fileTypePath;
            fileExt = ext;
            filename = filename + '.' + ext;
        }
        return { success: true, errMsg: '', fileName: filename, ext: fileExt, path: filePath, isLocal: false };
    }
    return { success: false, errMsg: '未知文件类型', fileName: '', ext: '', path: '', isLocal: false };
}
