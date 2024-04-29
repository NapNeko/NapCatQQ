import http from 'http';

const privateRkey = '';
function logDebug(...args) {
  console.log(...args);
}

const checkUrl = new Promise((resolve, reject) => {
  const uri = new URL('https://gchat.qpic.cn/download?appid=1407&fileid=CgkzNzk0NTAzMjYSFECDMhodswV7nH5Npuf2O8dstvL1GNaGEiD_CijQycnZsuaFA1CAvaMB&spec=0&rkey=CAESKE4_cASDm1t1mbnPfSzEvPzS-iYGLyXhjXjTRIhOHeSVDKkPp6Luaao');
  const options = {
    method: 'GET',
    host: uri.host,
    path: uri.pathname + uri.search,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      'Accept': '*/*',
      'Range': 'bytes=0-0'
    }
  };
  const req = http.request(options, (res) => {
    logDebug(`Check rkey status: ${res.statusCode}`);
    logDebug(`Check rkey headers: ${JSON.stringify(res.headers)}`);
    if (res.statusCode == 200 || res.statusCode === 206) {
      // console.log('The image URL is accessible.');
      resolve('ok');
    } else {
      reject('The image URL is not accessible.');
    }
  });

  req.setTimeout(3000, () => {
    req.destroy();
    reject('Check rkey request timed out');
  });

  req.on('error', (e) => {
    console.error(`Problem with rkey request: ${e.message}`);
    // reject(e.message);
  });
  req.end();
});

const startTime = Date.now();
checkUrl.then((result) => {
  const endTime = Date.now();
  console.log(result);
  console.log(`Time elapsed: ${endTime - startTime}ms`);
}).catch((error) => {
  const endTime = Date.now();
  console.error(error);
  console.log(`Time elapsed: ${endTime - startTime}ms`);
});
