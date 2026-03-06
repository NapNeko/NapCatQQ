import type { Context, Next } from 'hono';
import { WebUiConfig } from '@/napcat-webui-backend/index';

function normalizeIP (ip: string): string {
  if (ip.startsWith('::ffff:')) {
    const ipv4 = ip.substring(7);
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ipv4)) {
      return ipv4;
    }
  }
  return ip;
}

function isIPv6 (ip: string): boolean {
  return ip.includes(':');
}

function matchIPRule (ip: string, rule: string): boolean {
  const cleanIP = normalizeIP(ip);
  const cleanRule = normalizeIP(rule);

  if (cleanIP === cleanRule) return true;

  if (isIPv6(cleanIP) || isIPv6(cleanRule)) {
    if (cleanRule.includes('/')) {
      return matchIPv6CIDR(cleanIP, cleanRule);
    }
    return false;
  }

  if (cleanRule.includes('*')) {
    const ruleRegex = new RegExp('^' + cleanRule.replace(/\./g, '\\.').replace(/\*/g, '\\d+') + '$');
    return ruleRegex.test(cleanIP);
  }

  if (cleanRule.includes('/')) {
    return matchIPv4CIDR(cleanIP, cleanRule);
  }

  return false;
}

function matchIPv4CIDR (ip: string, cidr: string): boolean {
  const parts = cidr.split('/');
  if (parts.length !== 2) return false;

  const range = parts[0];
  const bits = parts[1];
  if (!range || !bits) return false;

  const prefixLength = parseInt(bits);
  if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 32) return false;

  const mask = prefixLength === 0 ? 0 : ~(2 ** (32 - prefixLength) - 1);

  const ipNum = ipv4ToNumber(ip);
  const rangeNum = ipv4ToNumber(range);

  if (ipNum === null || rangeNum === null) return false;

  return (ipNum & mask) === (rangeNum & mask);
}

function ipv4ToNumber (ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;

  const nums = parts.map(p => parseInt(p));
  if (nums.some(n => isNaN(n) || n < 0 || n > 255)) return null;

  return ((nums[0] || 0) << 24) + ((nums[1] || 0) << 16) + ((nums[2] || 0) << 8) + (nums[3] || 0);
}

function matchIPv6CIDR (ip: string, cidr: string): boolean {
  const parts = cidr.split('/');
  if (parts.length !== 2) return false;

  const range = parts[0];
  const bits = parts[1];
  if (!range || !bits) return false;

  const prefixLength = parseInt(bits);
  if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 128) return false;

  try {
    const ipSegments = expandIPv6(ip);
    const rangeSegments = expandIPv6(range);

    if (!ipSegments || !rangeSegments) return false;

    let bitsToCompare = prefixLength;
    for (let i = 0; i < 8; i++) {
      if (bitsToCompare <= 0) break;

      const ipSeg = ipSegments[i] ?? 0;
      const rangeSeg = rangeSegments[i] ?? 0;

      if (bitsToCompare >= 16) {
        if (ipSeg !== rangeSeg) return false;
        bitsToCompare -= 16;
      } else {
        const mask = (0xFFFF << (16 - bitsToCompare)) & 0xFFFF;
        if ((ipSeg & mask) !== (rangeSeg & mask)) return false;
        break;
      }
    }

    return true;
  } catch (_error) {
    return false;
  }
}

function expandIPv6 (ip: string): number[] | null {
  try {
    let addr = ip;

    const ipv4Match = addr.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
    if (ipv4Match && ipv4Match[1]) {
      const ipv4 = ipv4Match[1];
      const ipv4Parts = ipv4.split('.').map(p => parseInt(p));
      if (ipv4Parts.length === 4 && ipv4Parts.every(n => n >= 0 && n <= 255)) {
        const part1 = (ipv4Parts[0] ?? 0) << 8 | (ipv4Parts[1] ?? 0);
        const part2 = (ipv4Parts[2] ?? 0) << 8 | (ipv4Parts[3] ?? 0);
        addr = `::ffff:${part1.toString(16)}:${part2.toString(16)}`;
      }
    }

    if (addr.includes('::')) {
      const sides = addr.split('::');
      if (sides.length > 2) return null;

      const left = sides[0] ? sides[0].split(':') : [];
      const right = sides[1] ? sides[1].split(':') : [];
      const missing = 8 - left.length - right.length;

      if (missing < 0) return null;

      const segments = [
        ...left,
        ...Array(missing).fill('0'),
        ...right,
      ];

      return segments.map(s => parseInt(s || '0', 16));
    }

    const segments = addr.split(':');
    if (segments.length !== 8) return null;

    return segments.map(s => parseInt(s || '0', 16));
  } catch (_error) {
    return null;
  }
}

function isIPInList (ip: string, ipList: string[]): boolean {
  return ipList.some(rule => matchIPRule(ip, rule));
}

export function getClientIP (c: Context): string {
  const incoming = (c.env as any)?.incoming;
  return incoming?.socket?.remoteAddress || '';
}

export const corsMiddleware = async (c: Context, next: Next) => {
  const config = await WebUiConfig.GetWebUIConfig();

  let clientIP: string;
  if (config.enableXForwardedFor) {
    const forwardedFor = c.req.header('x-forwarded-for');
    if (typeof forwardedFor === 'string') {
      clientIP = forwardedFor.split(',')[0]?.trim() || '';
    } else {
      clientIP = getClientIP(c);
    }
  } else {
    clientIP = getClientIP(c);
  }

  if (config.accessControlMode === 'whitelist') {
    if (!isIPInList(clientIP, config.ipWhitelist || [])) {
      return c.json({ error: '访问被拒绝：IP不在白名单中' }, 403);
    }
  } else if (config.accessControlMode === 'blacklist') {
    if (isIPInList(clientIP, config.ipBlacklist || [])) {
      return c.json({ error: '访问被拒绝：IP在黑名单中' }, 403);
    }
  }

  const origin = c.req.header('origin') || '*';
  c.header('Access-Control-Allow-Origin', origin);
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }
  return next();
};
