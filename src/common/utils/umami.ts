import { request } from 'https';
export function postLoginStatus() {
  const req = request(
    {
      hostname: 'napcat.wumiao.wang',
      path: '/api/send',
      port: 443,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0'
      }
    },
    (res) => {
      //let data = '';
      res.on('data', (chunk) => {
        //data += chunk;
      });
      res.on('error', (err) => {
      });
      res.on('end', () => {
        //console.log('Response:', data);
      });
    }
  );
  req.on('error', (e) => {
    // console.error('Request error:', e);
  });
  const StatesData = {
    type: 'event',
    payload: {
      'website': '952bf82f-8f49-4456-aec5-e17db5f27f7e',
      'hostname': 'napcat.demo.cn',
      'screen': '1920x1080',
      'language': 'zh-CN',
      'title': 'OneBot.Login',
      'url': '/login/onebot11',
      'referrer': 'https://napcat.demo.cn/login?type=onebot11'
    }
  };
  req.write(JSON.stringify(StatesData));

  req.end();
}
