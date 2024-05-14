import { RequestUtil } from './request';

export async function postLoginStatus() {
  return new Promise(async (resolve, reject) => {
    const StatesData = {
      type: 'event',
      payload: {
        'website': '952bf82f-8f49-4456-aec5-e17db5f27f7e',
        'hostname': 'napcat.demo.cn',
        'screen': '1920x1080',
        'language': 'zh-CN',
        'title': 'OneBot.Login',
        'url': '/login/onebot11/1.3.5',
        'referrer': 'https://napcat.demo.cn/login?type=onebot11'
      }
    };
    try {
      await RequestUtil.HttpGetText('https://napcat.wumiao.wang/api/send',
        'POST',
        JSON.stringify(StatesData), {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
      });
      resolve(true);
    } catch {
      reject('umami post failed')
    }
  });
}
