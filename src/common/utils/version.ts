import { get as httpsGet } from 'node:https';
function requestMirror(url: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    httpsGet(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          const version = parsedData.version;
          resolve(version);
        } catch (error) {
          // 解析失败或无法访问域名，跳过
          resolve(undefined);
        }
      });
    }).on('error', (error) => {
      // 请求失败，跳过
      resolve(undefined);
    });
  });
}

export async function checkVersion(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const MirrorList =
            [
              'https://fastly.jsdelivr.net/gh/NapNeko/NapCatQQ@main/package.json',
              'https://gcore.jsdelivr.net/gh/NapNeko/NapCatQQ@main/package.json',
              'https://cdn.jsdelivr.us/gh/NapNeko/NapCatQQ@main/package.json',
              'https://jsd.cdn.zzko.cn/gh/NapNeko/NapCatQQ@main/package.json'
            ];
    for (const url of MirrorList) {
      const version = await requestMirror(url);
      if (version) {
        resolve(version);
      }
    }
    reject('get verison error!');
  });
}