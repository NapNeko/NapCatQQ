export class RequestUtil {
  //适用于获取服务器下发cookies时获取
  static async HttpGetCookies(url: string, method: string = 'GET'): Promise<Map<string, string>> {
    const response = await fetch(url, { method: method });
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const cookiesHeader = response.headers.get('set-cookie');
    if (!cookiesHeader) {
      return new Map<string, string>();
    }

    const result = new Map<string, string>();
    cookiesHeader.split(';').forEach((cookieLine) => {
      const [key, value] = cookieLine.split('=');
      result.set(key.trim(), value.trim());
    });

    return result;
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
        response = await fetch(url, { ...requestInit, body: data });
      } else {
        response = await fetch(url, { ...requestInit });
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