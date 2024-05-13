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
}
