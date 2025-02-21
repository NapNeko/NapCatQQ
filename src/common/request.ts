/* eslint-disable @typescript-eslint/no-explicit-any */
import https from 'node:https';
import http from 'node:http';

export class RequestUtil {
    // 适用于获取服务器下发cookies时获取，仅GET
    static async HttpsGetCookies(url: string): Promise<{ [key: string]: string }> {
        const client = url.startsWith('https') ? https : http;
        return new Promise((resolve, reject) => {
            const req = client.get(url, (res) => {
                const cookies: { [key: string]: string } = {};

                res.on('data', () => { }); // Necessary to consume the stream
                res.on('end', () => {
                    this.handleRedirect(res, url, cookies)
                        .then(resolve)
                        .catch(reject);
                });

                if (res.headers['set-cookie']) {
                    this.extractCookies(res.headers['set-cookie'], cookies);
                }
            });

            req.on('error', (error: Error) => {
                reject(error);
            });
        });
    }

    private static async handleRedirect(res: http.IncomingMessage, url: string, cookies: { [key: string]: string }): Promise<{ [key: string]: string }> {
        if (res.statusCode === 301 || res.statusCode === 302) {
            if (res.headers.location) {
                const redirectUrl = new URL(res.headers.location, url);
                const redirectCookies = await this.HttpsGetCookies(redirectUrl.href);
                // 合并重定向过程中的cookies
                return { ...cookies, ...redirectCookies };
            }
        }
        return cookies;
    }

    private static extractCookies(setCookieHeaders: string[], cookies: { [key: string]: string }) {
        setCookieHeaders.forEach((cookie) => {
            const parts = cookie.split(';')[0]?.split('=');
            if (parts) {
                const key = parts[0];
                const value = parts[1];
                if (key && value && key.length > 0 && value.length > 0) {
                    cookies[key] = value;
                }
            }
        });
    }

    // 请求和回复都是JSON data传原始内容 自动编码json
    static async HttpGetJson<T>(url: string, method: string = 'GET', data?: any, headers: {
        [key: string]: string
    } = {}, isJsonRet: boolean = true, isArgJson: boolean = true): Promise<T> {
        const option = new URL(url);
        const protocol = url.startsWith('https://') ? https : http;
        const options = {
            hostname: option.hostname,
            port: option.port,
            path: option.pathname + option.search,
            method: method,
            headers: headers,
        };
        // headers: {
        //       'Content-Type': 'application/json',
        //       'Content-Length': Buffer.byteLength(postData),
        //     },
        return new Promise((resolve, reject) => {
            const req = protocol.request(options, (res: http.IncomingMessage) => {
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
                    } catch (parseError: unknown) {
                        reject(new Error((parseError as Error).message));
                    }
                });
            });

            req.on('error', (error: Error) => {
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
}
