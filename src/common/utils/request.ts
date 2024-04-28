const https = require('node:https');
export async function HttpGetWithCookies(url: string): Promise<Map<string, string>> {
  return new Promise((resolve, reject) => {
    const result: Map<string, string> = new Map<string, string>();
    const req = https.get(url, (res: any) => {
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
export async function HttpPostCookies(url: string): Promise<Map<string, string>> {
  return new Promise((resolve, reject) => {
    const result: Map<string, string> = new Map<string, string>();
    const req = https.get(url, (res: any) => {
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