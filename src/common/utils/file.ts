import fs from 'fs';
import fsPromise, { stat } from 'fs/promises';
import crypto from 'crypto';
import util from 'util';
import path from 'node:path';
import { log, logError } from './log';
import * as fileType from 'file-type';
import { randomUUID } from 'crypto';
import { napCatCore } from '@/core';

export const getNapCatDir = () => {
  const p = path.join(napCatCore.dataPath, 'NapCat');
  fs.mkdirSync(p, { recursive: true });
  return p;
};
export const getTempDir = () => {
  const p = path.join(getNapCatDir(), 'temp');
  // 创建临时目录
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
  return p;
};


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
    data: ''
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
  const chunks: Buffer[] = [];
  let url: string;
  let headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36'
  };
  if (typeof options === 'string') {
    url = options;
    const host = new URL(url).hostname;
    headers['Host'] = host;
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

export async function uri2local(UriOrPath: string, fileName: string | null = null): Promise<Uri2LocalRes> {
  const res = {
    success: false,
    errMsg: '',
    fileName: '',
    ext: '',
    path: '',
    isLocal: false
  };
  if (!fileName) fileName = randomUUID();
  let filePath = path.join(getTempDir(), fileName);//临时目录
  let url = null;
  //区分path和uri
  try {
    if (fs.existsSync(UriOrPath)) url = new URL('file://' + UriOrPath);
  } catch (error: any) { }
  try {
    url = new URL(UriOrPath);
  } catch (error: any) { }

  //验证url
  if (!url) {
    res.errMsg = `UriOrPath ${UriOrPath} 解析失败,可能${UriOrPath}不存在`;
    return res;
  }

  if (url.protocol == 'base64:') {
    // base64转成文件
    const base64Data = UriOrPath.split('base64://')[1];
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
    } catch (e: any) {
      res.errMsg = 'base64文件下载失败,' + e.toString();
      return res;
    }
  } else if (url.protocol == 'http:' || url.protocol == 'https:') {
    // 下载文件
    let buffer: Buffer | null = null;
    try {
      buffer = await httpDownload(UriOrPath);
    } catch (e: any) {
      res.errMsg = `${url}下载失败,` + e.toString();
      return res;
    }
    try {
      const pathInfo = path.parse(decodeURIComponent(url.pathname));
      if (pathInfo.name) {
        fileName = pathInfo.name;
        if (pathInfo.ext) {
          fileName += pathInfo.ext;
          // res.ext = pathInfo.ext
        }
      }
      fileName = fileName.replace(/[/\\:*?"<>|]/g, '_');
      res.fileName = fileName;
      filePath = path.join(getTempDir(), randomUUID() + fileName);
      fs.writeFileSync(filePath, buffer);
    } catch (e: any) {
      res.errMsg = `${url}下载失败,` + e.toString();
      return res;
    }
  } else {
    let pathname: string;
    if (url.protocol === 'file:') {
      // await fs.copyFile(url.pathname, filePath);
      pathname = decodeURIComponent(url.pathname);
      if (process.platform === 'win32') {
        filePath = pathname.slice(1);
      } else {
        filePath = pathname;
      }
    }
    else {
      // 26702执行forword file文件操作 不应该在这里乱来
      // const cache = await dbUtil.getFileCacheByName(uri);
      // if (cache) {
      //   filePath = cache.path;
      // } else {
      //   filePath = uri;
      // }
    }
    res.isLocal = true;
  }
  // else{
  //     res.errMsg = `不支持的file协议,` + url.protocol
  //     return res
  // }
  // if (isGIF(filePath) && !res.isLocal) {
  //     await fs.rename(filePath, filePath + ".gif");
  //     filePath += ".gif";
  // }
  if (!res.isLocal && !res.ext) {
    try {
      const ext: string | undefined = (await fileType.fileTypeFromFile(filePath))?.ext;
      if (ext) {
        log('获取文件类型', ext, filePath);
        fs.renameSync(filePath, filePath + `.${ext}`);
        filePath += `.${ext}`;
        res.fileName += `.${ext}`;
        res.ext = ext;
      }
    } catch (e) {
      // log("获取文件类型失败", filePath,e.stack)
    }
  }
  res.success = true;
  res.path = filePath;
  return res;
}

export async function copyFolder(sourcePath: string, destPath: string) {
  try {
    const entries = await fsPromise.readdir(sourcePath, { withFileTypes: true });
    await fsPromise.mkdir(destPath, { recursive: true });
    for (const entry of entries) {
      const srcPath = path.join(sourcePath, entry.name);
      const dstPath = path.join(destPath, entry.name);
      if (entry.isDirectory()) {
        await copyFolder(srcPath, dstPath);
      } else {
        try {
          await fsPromise.copyFile(srcPath, dstPath);
        } catch (error) {
          logError(`无法复制文件 '${srcPath}' 到 '${dstPath}': ${error}`);
          // 这里可以决定是否要继续复制其他文件
        }
      }
    }
  } catch (error) {
    logError('复制文件夹时出错:', error);
  }
}
