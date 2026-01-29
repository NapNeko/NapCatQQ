import fs from 'fs';
import { stat } from 'fs/promises';
import crypto, { randomUUID } from 'crypto';
import path from 'node:path';
import http from 'node:http';
import tls from 'node:tls';
import { solveProblem } from '@/napcat-common/src/helper';

export interface HttpDownloadOptions {
  url: string;
  headers?: Record<string, string> | string;
  proxy?: string;
}

type Uri2LocalRes = {
  success: boolean,
  errMsg: string,
  fileName: string,
  path: string;
};

// 定义一个异步函数来检查文件是否存在
export function checkFileExist (path: string, timeout: number = 3000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function check () {
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
export async function checkFileExistV2 (path: string, timeout: number = 3000): Promise<void> {
  // 使用 Promise.race 来同时进行文件状态检查和超时计时
  // Promise.race 会返回第一个解决（resolve）或拒绝（reject）的 Promise
  await Promise.race([
    checkFile(path),
    timeoutPromise(timeout, `文件不存在: ${path}`),
  ]);
}

// 转换超时时间至 Promise
function timeoutPromise (timeout: number, errorMsg: string): Promise<void> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error(errorMsg));
    }, timeout);
  });
}

// 异步检查文件是否存在
async function checkFile (path: string): Promise<void> {
  try {
    await stat(path);
  } catch (error: unknown) {
    if ((error as Error & { code: string; }).code === 'ENOENT') {
      // 如果文件不存在，则抛出一个错误
      throw new Error(`文件不存在: ${path}`);
    } else {
      // 对于 stat 调用的其他错误，重新抛出
      throw error;
    }
  }
  // 如果文件存在，则无需做任何事情，Promise 解决（resolve）自身
}

export function calculateFileMD5 (filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 创建一个流式读取器
    const stream = fs.createReadStream(filePath);
    const hash = crypto.createHash('md5');

    stream.on('data', (data) => {
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

async function tryDownload (options: string | HttpDownloadOptions, useReferer: boolean = false): Promise<Response> {
  let url: string;
  let proxy: string | undefined;
  let headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36',
  };
  if (typeof options === 'string') {
    url = options;
    headers['Host'] = new URL(url).hostname;
  } else {
    url = options.url;
    proxy = options.proxy;
    if (options.headers) {
      if (typeof options.headers === 'string') {
        headers = JSON.parse(options.headers);
      } else {
        headers = options.headers;
      }
    }
  }
  if (useReferer && !headers['Referer']) {
    headers['Referer'] = url;
  }

  // 如果配置了代理，使用代理下载
  if (proxy) {
    try {
      const response = await httpDownloadWithProxy(url, headers, proxy);
      return new Response(response, { status: 200, statusText: 'OK' });
    } catch (proxyError) {
      // 如果代理失败，记录错误并尝试直接下载
      console.error('代理下载失败，尝试直接下载:', proxyError);
    }
  }

  const fetchRes = await fetch(url, { headers, redirect: 'follow' }).catch((err) => {
    if (err.cause) {
      throw err.cause;
    }
    throw err;
  });
  return fetchRes;
}

/**
 * 使用 HTTP/HTTPS 代理下载文件
 */
function httpDownloadWithProxy (url: string, headers: Record<string, string>, proxy: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(url);
    const proxyUrl = new URL(proxy);

    const isTargetHttps = targetUrl.protocol === 'https:';
    const proxyPort = parseInt(proxyUrl.port) || (proxyUrl.protocol === 'https:' ? 443 : 80);
    
    // 代理认证头
    const proxyAuthHeader = proxyUrl.username && proxyUrl.password
      ? { 'Proxy-Authorization': 'Basic ' + Buffer.from(`${decodeURIComponent(proxyUrl.username)}:${decodeURIComponent(proxyUrl.password)}`).toString('base64') }
      : {};

    if (isTargetHttps) {
      // HTTPS 目标：需要通过 CONNECT 建立隧道
      const connectReq = http.request({
        host: proxyUrl.hostname,
        port: proxyPort,
        method: 'CONNECT',
        path: `${targetUrl.hostname}:${targetUrl.port || 443}`,
        headers: {
          'Host': `${targetUrl.hostname}:${targetUrl.port || 443}`,
          ...proxyAuthHeader,
        },
      });

      connectReq.on('connect', (res, socket) => {
        if (res.statusCode !== 200) {
          socket.destroy();
          reject(new Error(`代理 CONNECT 失败: ${res.statusCode} ${res.statusMessage}`));
          return;
        }

        // 在隧道上建立 TLS 连接
        const tlsSocket = tls.connect({
          socket: socket,
          servername: targetUrl.hostname,
          rejectUnauthorized: true,
        }, () => {
          // TLS 握手成功，发送 HTTP 请求
          const requestPath = targetUrl.pathname + targetUrl.search;
          const requestHeaders = {
            ...headers,
            'Host': targetUrl.hostname,
            'Connection': 'close',
          };
          
          const headerLines = Object.entries(requestHeaders)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\r\n');
          
          const httpRequest = `GET ${requestPath} HTTP/1.1\r\n${headerLines}\r\n\r\n`;
          tlsSocket.write(httpRequest);
        });

        // 解析 HTTP 响应
        let responseData = Buffer.alloc(0);
        let headersParsed = false;
        let statusCode = 0;
        let isChunked = false;
        let bodyData = Buffer.alloc(0);
        let redirectLocation: string | null = null;

        tlsSocket.on('data', (chunk: Buffer) => {
          responseData = Buffer.concat([responseData, chunk]);
          
          if (!headersParsed) {
            const headerEndIndex = responseData.indexOf('\r\n\r\n');
            if (headerEndIndex !== -1) {
              headersParsed = true;
              const headerStr = responseData.subarray(0, headerEndIndex).toString();
              const headerLines = headerStr.split('\r\n');
              
              // 解析状态码
              const statusLine = headerLines[0];
              const statusMatch = statusLine?.match(/HTTP\/\d\.\d\s+(\d+)/);
              statusCode = statusMatch ? parseInt(statusMatch[1]!) : 0;
              
              // 解析响应头
              for (const line of headerLines.slice(1)) {
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();
                if (key?.toLowerCase() === 'transfer-encoding' && value.toLowerCase() === 'chunked') {
                  isChunked = true;
                } else if (key?.toLowerCase() === 'location') {
                  redirectLocation = value;
                }
              }
              
              bodyData = responseData.subarray(headerEndIndex + 4);
            }
          } else {
            bodyData = Buffer.concat([bodyData, chunk]);
          }
        });

        tlsSocket.on('end', () => {
          // 处理重定向
          if (statusCode >= 300 && statusCode < 400 && redirectLocation) {
            const redirectUrl = redirectLocation.startsWith('http') 
              ? redirectLocation 
              : `${targetUrl.protocol}//${targetUrl.host}${redirectLocation}`;
            httpDownloadWithProxy(redirectUrl, headers, proxy).then(resolve).catch(reject);
            return;
          }
          
          if (statusCode !== 200) {
            reject(new Error(`下载失败: ${statusCode}`));
            return;
          }
          
          // 处理 chunked 编码
          if (isChunked) {
            resolve(parseChunkedBody(bodyData));
          } else {
            resolve(bodyData);
          }
        });

        tlsSocket.on('error', (err) => {
          reject(new Error(`TLS 连接错误: ${err.message}`));
        });
      });

      connectReq.on('error', (err) => {
        reject(new Error(`代理连接错误: ${err.message}`));
      });

      connectReq.end();
    } else {
      // HTTP 目标：直接通过代理请求
      const req = http.request({
        host: proxyUrl.hostname,
        port: proxyPort,
        method: 'GET',
        path: url, // 完整 URL
        headers: {
          ...headers,
          'Host': targetUrl.hostname,
          ...proxyAuthHeader,
        },
      }, (response) => {
        handleResponse(response, resolve, reject, url, headers, proxy);
      });

      req.on('error', (err) => {
        reject(new Error(`代理请求错误: ${err.message}`));
      });

      req.end();
    }
  });
}

/**
 * 解析 chunked 编码的响应体
 */
function parseChunkedBody (data: Buffer): Buffer {
  const chunks: Buffer[] = [];
  let offset = 0;
  
  while (offset < data.length) {
    // 查找 chunk 大小行的结束
    const lineEnd = data.indexOf('\r\n', offset);
    if (lineEnd === -1) break;
    
    const sizeStr = data.subarray(offset, lineEnd).toString().split(';')[0]; // 忽略 chunk 扩展
    const chunkSize = parseInt(sizeStr!, 16);
    
    if (chunkSize === 0) break; // 最后一个 chunk
    
    const chunkStart = lineEnd + 2;
    const chunkEnd = chunkStart + chunkSize;
    
    if (chunkEnd > data.length) break;
    
    chunks.push(data.subarray(chunkStart, chunkEnd));
    offset = chunkEnd + 2; // 跳过 chunk 数据后的 \r\n
  }
  
  return Buffer.concat(chunks);
}

/**
 * 处理 HTTP 响应
 */
function handleResponse (
  response: http.IncomingMessage,
  resolve: (value: Buffer) => void,
  reject: (reason: Error) => void,
  _url: string,
  headers: Record<string, string>,
  proxy: string
): void {
  // 处理重定向
  if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
    httpDownloadWithProxy(response.headers.location, headers, proxy).then(resolve).catch(reject);
    return;
  }

  if (response.statusCode !== 200) {
    reject(new Error(`下载失败: ${response.statusCode} ${response.statusMessage}`));
    return;
  }

  const chunks: Buffer[] = [];
  response.on('data', (chunk: Buffer) => chunks.push(chunk));
  response.on('end', () => resolve(Buffer.concat(chunks)));
  response.on('error', reject);
}

export async function httpDownload (options: string | HttpDownloadOptions): Promise<Buffer> {
  const useReferer = typeof options === 'string';
  let resp = await tryDownload(options);
  if (resp.status === 403 && useReferer) {
    resp = await tryDownload(options, true);
  }
  if (!resp.ok) throw new Error(`下载文件失败: ${resp.statusText}`);
  const blob = await resp.blob();
  const buffer = await blob.arrayBuffer();
  return Buffer.from(buffer);
}

export enum FileUriType {
  Unknown = 0,
  Local = 1,
  Remote = 2,
  Base64 = 3,
}

export async function checkUriType (Uri: string) {
  const LocalFileRet = await solveProblem((uri: string) => {
    if (fs.existsSync(path.normalize(uri))) {
      return { Uri: path.normalize(uri), Type: FileUriType.Local };
    }
    return undefined;
  }, Uri);
  if (LocalFileRet) return LocalFileRet;
  const OtherFileRet = await solveProblem((uri: string) => {
    // 再判断是否是Http
    if (uri.startsWith('http:') || uri.startsWith('https:')) {
      return { Uri: uri, Type: FileUriType.Remote };
    }
    // 再判断是否是Base64
    if (uri.startsWith('base64:')) {
      return { Uri: uri, Type: FileUriType.Base64 };
    }
    // 默认file://
    if (uri.startsWith('file:')) {
      const filePath: string = decodeURIComponent(uri.startsWith('file:///') && process.platform === 'win32' ? uri.slice(8) : uri.slice(7));
      return { Uri: filePath, Type: FileUriType.Local };
    }
    if (uri.startsWith('data:')) {
      const data = uri.split(',')[1];
      if (data) return { Uri: data, Type: FileUriType.Base64 };
    }
    return undefined;
  }, Uri);
  if (OtherFileRet) return OtherFileRet;

  return { Uri, Type: FileUriType.Unknown };
}

export async function uriToLocalFile (dir: string, uri: string, filename: string = randomUUID(), headers?: Record<string, string>, proxy?: string): Promise<Uri2LocalRes> {
  const { Uri: HandledUri, Type: UriType } = await checkUriType(uri);

  const filePath = path.join(dir, filename);

  switch (UriType) {
    case FileUriType.Local: {
      const fileExt = path.extname(HandledUri);
      const localFileName = path.basename(HandledUri, fileExt) + fileExt;
      const tempFilePath = path.join(dir, filename + fileExt);
      fs.copyFileSync(HandledUri, tempFilePath);
      return { success: true, errMsg: '', fileName: localFileName, path: tempFilePath };
    }

    case FileUriType.Remote: {
      const buffer = await httpDownload({ url: HandledUri, headers: headers ?? {}, proxy });
      fs.writeFileSync(filePath, buffer);
      return { success: true, errMsg: '', fileName: filename, path: filePath };
    }

    case FileUriType.Base64: {
      const base64 = HandledUri.replace(/^base64:\/\//, '');
      const base64Buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(filePath, base64Buffer);
      return { success: true, errMsg: '', fileName: filename, path: filePath };
    }

    default:
      return { success: false, errMsg: `识别URL失败, uri= ${uri}`, fileName: '', path: '' };
  }
}
