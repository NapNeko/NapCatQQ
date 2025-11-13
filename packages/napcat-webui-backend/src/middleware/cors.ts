import type { RequestHandler } from 'express';
import { WebUiConfig } from '@/napcat-webui-backend/index';

// 检查是否为局域网IP地址
function isLANIP (ip: string): boolean {
  if (!ip) return false;

  // 移除IPv6的前缀，如果存在
  const cleanIP = ip.replace(/^::ffff:/, '');

  // 本地回环地址
  if (cleanIP === '127.0.0.1' || cleanIP === 'localhost' || cleanIP === '::1') {
    return true;
  }

  // 检查IPv4私有网络地址
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = cleanIP.match(ipv4Regex);

  if (match) {
    const [, a, b] = match.map(Number);

    // 10.0.0.0/8
    if (a === 10) return true;

    // 172.16.0.0/12
    if (a === 172 && b !== undefined && b >= 16 && b <= 31) return true;

    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;

    // 169.254.0.0/16 (链路本地地址)
    if (a === 169 && b === 254) return true;
  }

  return false;
}

// CORS 中间件，跨域用
export const cors: RequestHandler = async (req, res, next) => {
  // 检查是否禁用非局域网访问
  const config = await WebUiConfig.GetWebUIConfig();
  if (config.disableNonLANAccess) {
    const clientIP = req.ip || req.socket.remoteAddress || '';
    if (!isLANIP(clientIP)) {
      res.status(403).json({ error: '非局域网访问被禁止' });
      return;
    }
  }

  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
};
