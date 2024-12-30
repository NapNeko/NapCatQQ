import * as net from 'net';
import * as https from 'https';

export const cloudflareIps = [
    '103.21.244.0/22',
    '103.22.200.0/22',
    '103.31.4.0/22',
    '104.16.0.0/13',
    '104.24.0.0/14',
    '108.162.192.0/18',
    '131.0.72.0/22',
    '141.101.64.0/18',
    '162.158.0.0/15',
    '172.64.0.0/13',
    '173.245.48.0/20',
    '188.114.96.0/20',
    '190.93.240.0/20',
    '197.234.240.0/22',
    '198.41.128.0/17'
];

// 将IP地址转换为整数
const ipToInt = (ip: string): number => ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;

// 将整数转换为IP地址
const intToIp = (int: number): string => `${(int >>> 24) & 0xFF}.${(int >>> 16) & 0xFF}.${(int >>> 8) & 0xFF}.${int & 0xFF}`;

// 解析CIDR范围
const parseCIDR = (cidr: string): string[] => {
    const [base, maskLength] = cidr.split('/');
    const baseIP = ipToInt(base);
    return Array.from({ length: 1 << (32 - Number(maskLength)) }, (_, i) => intToIp(baseIP + i))
        .filter(ip => !ip.endsWith('.0')); // 排除以 .0 结尾的 IP 地址
}

// 解析IP地址和IP范围
const parseIPs = (ipList: string[]): string[] => ipList.flatMap(ip => ip.includes('/') ? parseCIDR(ip) : net.isIP(ip) ? [ip] : []);

// 检查URL的HTTP连接性
const checkUrl = (ip: string, domain: string): Promise<boolean> => new Promise((resolve) => {
    const options = {
        hostname: ip,
        port: 443,
        method: 'GET',
        path: '/',
        timeout: 2000,
        headers: {
            'Host': domain,
            "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.2128.93 Safari/537.36'
        }
    };
    const req = https.request(options, (res) => {
        res.on('data', (data) => {
            //console.log('[NetWork] [Scan] Checking Data! ', domain, ' --> ', ip, data.toString());
        });
        if (res.statusCode && res.statusCode > 0 && res.statusCode < 500) {
            console.log('[NetWork] [Scan] Checking Connect! ', domain, ' --> ', ip);
            resolve(true);
        } else {
            console.log('[NetWork] [Scan] Checking Failed! ', domain, ' --> ', ip, ' Status Code: ', res.statusCode);
            resolve(false);
        }
    });
    req.on('error', () => {
        console.log('[NetWork] [Scan] Checking Error! ', domain, ' --> ', ip);
        resolve(false);
    });
    req.on('timeout', () => {
        req.destroy();
        console.log('[NetWork] [Scan] Checking Timeout! ', domain, ' --> ', ip);
        resolve(false);
    });
    req.end();
});

// 检查特定域名的HTTP连接性
const checkDomainConnectivity = async (ip: string, domains: string[]): Promise<boolean> => {
    const checkPromises = domains.map(domain => checkUrl(ip, domain));
    const results = await Promise.all(checkPromises);
    return results.some(result => result);
}

export const optimizeCloudflareIPs = async (ipList: string[], domains: string[]): Promise<string | undefined> => {
    if ((await Promise.all(domains.map(domain => checkUrl(domain, domain)))).every(result => result)) return undefined;
    for (const ip of parseIPs(ipList)) {
        if (await checkDomainConnectivity(ip, domains)) return ip;
    }
    return undefined;
}

export const findRealHost = async () => {
    const domains = ['umami.napneko.icu', 'rkey.napneko.icu'];
    const ip = await optimizeCloudflareIPs(cloudflareIps, domains);
    return {
        'umami.napneko.icu': ip ?? 'umami.napneko.icu',
        'rkey.napneko.icu': ip ?? 'rkey.napneko.icu'
    };
}

type Cache = {
    [key: string]: string;
};

let cache: Cache = {
    'cached': '',
    'umami.napneko.icu': 'umami.napneko.icu',
    'rkey.napneko.icu': 'rkey.napneko.icu'
};

export const getDomainIp = async (domain: string) => {
    if (!cache.cached) {
        cache = { cached: 'cached', ...(await findRealHost()) };
    }
    console.log('[NetWork] [Cache] ', domain, ' --> ', cache[domain] ?? domain);
    return cache[domain] ?? domain;
}