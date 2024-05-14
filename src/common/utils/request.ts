import https from 'node:https';
import http from 'node:http';

export class RequestUtil {
  // 适用于获取服务器下发cookies时获取，仅GET
  static async HttpsGetCookies(url: string): Promise<Map<string, string>> {
    return new Promise<Map<string, string>>((resolve, reject) => {
      const protocol = url.startsWith('https://') ? https : http;
      protocol.get(url, (res) => {
        const cookiesHeader = res.headers['set-cookie'];
        if (!cookiesHeader) {
          resolve(new Map<string, string>());
        } else {
          const cookiesMap = new Map<string, string>();
          cookiesHeader.forEach((cookieStr) => {
            cookieStr.split(';').forEach((cookiePart) => {
              const trimmedPart = cookiePart.trim();
              if (trimmedPart.includes('=')) {
                const [key, value] = trimmedPart.split('=').map(part => part.trim());
                cookiesMap.set(key, decodeURIComponent(value)); // 解码cookie值
              }
            });
          });
          resolve(cookiesMap);
        }
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  // 请求和回复都是JSON data传原始内容 自动编码json
  static async HttpGetJson<T>(url: string, method: string = 'GET', data?: any, headers: Record<string, string> = {}) {
    const protocol = url.startsWith('https://') ? https : http;
    const options = {
      hostname: url.replace(/^(https?:\/\/)?(.*?)(\/.*)?$/, '$2'),
      port: url.startsWith('https://') ? 443 : 80,
      path: url.replace(/^(https?:\/\/[^\/]+)?(.*?)(\/.*)?$/, '$3'),
      method,
      headers,
    };

    return new Promise((resolve, reject) => {
      const req = protocol.request(options, (res: any) => {
        let responseBody = '';
        res.on('data', (chunk: string | Buffer) => {
          responseBody += chunk.toString();
        });

        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              const responseJson = JSON.parse(responseBody);
              resolve(responseJson as T);
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
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // 请求返回都是原始内容
  static async HttpGetText(url: string, method: string = 'GET', data?: any, headers: Record<string, string> = {}) {
    return this.HttpGetJson<string>(url, method, data, headers);
  }
}