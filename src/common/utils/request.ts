export class RequestUtil {
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
}