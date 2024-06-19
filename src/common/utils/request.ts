import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import { NTQQUserApi } from '@/core';
export class RequestUtil {
  // 适用于获取服务器下发cookies时获取，仅GET
  static async HttpsGetCookies(url: string): Promise<{ [key: string]: string }> {
    const client = url.startsWith('https') ? https : http;
    return new Promise((resolve, reject) => {
      client.get(url, (res) => {
        let cookies: { [key: string]: string } = {};
        const handleRedirect = (res: http.IncomingMessage) => {
          //console.log(res.headers.location);
          if (res.statusCode === 301 || res.statusCode === 302) {
            if (res.headers.location) {
              const redirectUrl = new URL(res.headers.location, url);
              RequestUtil.HttpsGetCookies(redirectUrl.href).then((redirectCookies) => {
                // 合并重定向过程中的cookies
                cookies = { ...cookies, ...redirectCookies };
                resolve(cookies);
              });
            } else {
              resolve(cookies);
            }
          } else {
            resolve(cookies);
          }
        };
        res.on('data', () => { }); // Necessary to consume the stream
        res.on('end', () => {
          handleRedirect(res);
        });
        if (res.headers['set-cookie']) {
          //console.log(res.headers['set-cookie']);
          res.headers['set-cookie'].forEach((cookie) => {
            const parts = cookie.split(';')[0].split('=');
            const key = parts[0];
            const value = parts[1];
            if (key && value && key.length > 0 && value.length > 0) {
              cookies[key] = value;
            }
          });
        }
      }).on('error', (err) => {
        reject(err);
      });
    });
  }



  // 请求和回复都是JSON data传原始内容 自动编码json
  static async HttpGetJson<T>(url: string, method: string = 'GET', data?: any, headers: { [key: string]: string } = {}, isJsonRet: boolean = true, isArgJson: boolean = true): Promise<T> {
    const option = new URL(url);
    const protocol = url.startsWith('https://') ? https : http;
    const options = {
      hostname: option.hostname,
      port: option.port,
      path: option.href,
      method: method,
      headers: headers
    };
    // headers: {
    //       'Content-Type': 'application/json',
    //       'Content-Length': Buffer.byteLength(postData),
    //     },
    return new Promise((resolve, reject) => {
      const req = protocol.request(options, (res: any) => {
        let responseBody = '';
        res.on('data', (chunk: string | Buffer) => {
          responseBody += chunk.toString();
        });

        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              if (isJsonRet) {
                const responseJson = JSON.parse(responseBody);
                resolve(responseJson as T);
              } else {
                resolve(responseBody as T);
              }
            } else {
              reject(new Error(`Unexpected status code: ${res.statusCode}`));
            }
          } catch (parseError) {
            reject(parseError);
          }
        });
      });

      req.on('error', (error: any) => {
        reject(error);
      });
      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        if (isArgJson) {
          req.write(JSON.stringify(data));
        } else {
          req.write(data);
        }

      }
      req.end();
    });
  }

  // 请求返回都是原始内容
  static async HttpGetText(url: string, method: string = 'GET', data?: any, headers: { [key: string]: string } = {}) {
    return this.HttpGetJson<string>(url, method, data, headers, false, false);
  }
  static async HttpUploadFileForOpenPlatform(filePath: string) {
    const cookies = Object.entries(await NTQQUserApi.getCookies('connect.qq.com')).map(([key, value]) => `${key}=${value}`).join('; ');
    return new Promise((resolve, reject) => {
      var options = {
        'method': 'POST',
        'hostname': 'cgi.connect.qq.com',
        'path': '/qqconnectopen/upload_share_image',
        'headers': {
          'Referer': 'https://cgi.connect.qq.com',
          'Cookie': cookies,
          'Accept': '*/*',
          'Host': 'cgi.connect.qq.com',
          'Connection': 'keep-alive',
          'Content-Type': 'multipart/form-data; boundary=--------------------------800945582706338065206240'
        },
        'maxRedirects': 20
      };
      let body;
      let req = https.request(options, function (res) {
        let chunks: any = [];

        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function () {
          body = Buffer.concat(chunks);
          console.log(body.toString());
        });

        res.on("error", function (error) {
          console.error(error);
        });
      });

      var postData = "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"share_image\"; filename=\"C:/1.png\"\r\nContent-Type: \"{Insert_File_Content_Type}\"\r\n\r\n" + fs.readFileSync(filePath) + "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--";
      req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
      req.write(postData);
      req.end();
      if (body) {
        resolve(JSON.parse(body));
      } else {
        reject();
      }
    });
  }
}