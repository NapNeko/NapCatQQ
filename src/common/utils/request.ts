import { get as httpsGet } from 'https';
export class RequestUtil {
  //适用于获取服务器下发cookies时获取 仅get
  static async HttpsGetCookies(url: string): Promise<Map<string, string>> {
    return new Promise((resolve, reject) => {
      const result: Map<string, string> = new Map<string, string>();
      const req = httpsGet(url, (res: any) => {
        res.on('data', (data: any) => {
        });
        res.on('end', () => {
          try {
            const responseCookies = res.headers['set-cookie'];
            for (const line of responseCookies) {
              const parts = line.split(';');
              const [key, value] = parts[0].split('=');
              result.set(key, value);
            }
          } catch (e) {
          }
          resolve(result);
        });
      });
      req.on('error', (error: any) => {
        resolve(result);
        // console.log(error)
      });
      req.end();
    });
  }
  // 请求和回复都是JSON data传原始内容 自动编码json
  static async HttpGetJson<T>(url: string, method: string = 'GET', data?: any, headers: Record<string, string> = {}):
    Promise<T> {
    let body: BodyInit | undefined = undefined;
    let requestInit: RequestInit = { method: method };

    if (method.toUpperCase() === 'POST' && data !== undefined) {
      body = JSON.stringify(data);
      if (headers) {
        headers['Content-Type'] = 'application/json';
        requestInit.headers = new Headers(headers);
      } else {
        requestInit.headers = new Headers({ 'Content-Type': 'application/json' });
      }
    } else {
      requestInit.headers = new Headers(headers);
    }
    try {
      const response = await fetch(url, { ...requestInit, body });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonResult = await response.json();
      return jsonResult as T;
    } catch (error: any) {
      throw new Error(`Failed to fetch JSON: ${error.message}`);
    }
  }
  // 请求返回都是原始内容
  static async HttpGetText(url: string, method: string = 'GET', data?: any, headers: Record<string, string> = {}): Promise<string> {
    let requestInit: RequestInit = { method: method };
    if (method.toUpperCase() === 'POST' && data !== undefined) {
      if (headers) {
        headers['Content-Type'] = 'application/json';
        requestInit.headers = new Headers(headers);
      } else {
        requestInit.headers = new Headers({ 'Content-Type': 'application/json' });
      }
    } else {
      requestInit.headers = new Headers(headers);
    }
    try {
      let response;
      if (method.toUpperCase() === 'POST') {
        //console.log({ method: 'POST', ...requestInit, body: data });
        response = await fetch(url, { method: 'POST', ...requestInit, body: data });
      } else {
        response = await fetch(url, { method: method, ...requestInit });
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonResult = await response.text();
      return jsonResult;
    } catch (error: any) {
      throw new Error(`Failed to fetch JSON: ${error.message}`);
    }
  }
}