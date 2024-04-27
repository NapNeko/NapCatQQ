const https = require('node:https');
export async function HttpGetWithCookies(url: string) {
    const req = https.get(url, (res: any) => {
        res.on('data', (data: any) => {
        });
        res.on('end', () => {
            const responseCookies = res.headers['set-cookie'];
            console.log('获取到的 cookies:', responseCookies);
            console.log(res.headers)
        });
    });

    req.on('error', (error: any) => {
        // console.log(error)
    })
    req.end()
}