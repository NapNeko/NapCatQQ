/**
 * Auth primitives — 100% Node.js built-ins, ZERO npm packages.
 *
 * Passwords : crypto.scrypt
 * JWT       : crypto.createHmac (HS256)
 * TOTP      : crypto.createHmac HOTP/TOTP (RFC 6238)
 */
import {
  scrypt, randomBytes, timingSafeEqual,
  createHmac, type BinaryLike,
} from 'crypto';
import { promisify } from 'util';
import { configManager } from '../config/index.js';

const scryptAsync = promisify(scrypt) as (
  pw: string, salt: string, len: number
) => Promise<Buffer>;

// ─── Password hashing ─────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  const salt    = randomBytes(16).toString('hex');
  const derived = await scryptAsync(plain, salt, 32);
  return `scrypt:v1:${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  const parts = hash.split(':');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
  const [, , salt, storedHex] = parts;
  try {
    const derived = await scryptAsync(plain, salt, 32);
    const stored  = Buffer.from(storedHex, 'hex');
    return derived.length === stored.length && timingSafeEqual(derived, stored);
  } catch { return false; }
}

// ─── JWT (HS256 — pure crypto) ────────────────────────────────────────────────

export interface JWTPayload { sub: number; role: string; iat?: number; exp?: number; }

const jwtBlacklist = new Set<string>();

function parseExpiry(s: string): number {
  const m = String(s).match(/^(\d+)(s|m|h|d)?$/);
  if (!m) return 7200;
  return parseInt(m[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[m[2] as string] ?? 1);
}

function jwtSign(payload: object, secret: string, expiresIn: string): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + parseExpiry(expiresIn);
  const hdr  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat, exp })).toString('base64url');
  const sig  = createHmac('sha256', secret as BinaryLike).update(`${hdr}.${body}`).digest('base64url');
  return `${hdr}.${body}.${sig}`;
}

function jwtVerify(token: string, secret: string): JWTPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');
  const [hdr, body, sig] = parts;
  const expected = createHmac('sha256', secret as BinaryLike).update(`${hdr}.${body}`).digest('base64url');
  // constant-time compare (both must be same length for timingSafeEqual)
  const sigBuf = Buffer.from(sig,      'base64url');
  const expBuf = Buffer.from(expected, 'base64url');
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf))
    throw new Error('Invalid signature');
  const pl = JSON.parse(Buffer.from(body, 'base64url').toString()) as JWTPayload;
  if (pl.exp && Math.floor(Date.now() / 1000) > pl.exp) throw new Error('Token expired');
  return pl;
}

export function signAccessToken(payload: JWTPayload): string {
  const cfg = configManager.get().webui;
  return jwtSign(payload, cfg.jwtSecret, cfg.jwtExpiresIn);
}

export function signRefreshToken(payload: Pick<JWTPayload, 'sub'>): string {
  const cfg = configManager.get().webui;
  return jwtSign(payload, cfg.jwtSecret, cfg.refreshExpiresIn);
}

export function verifyToken(token: string): JWTPayload | null {
  if (jwtBlacklist.has(token)) return null;
  try { return jwtVerify(token, configManager.get().webui.jwtSecret); }
  catch { return null; }
}

export function revokeToken(token: string): void { jwtBlacklist.add(token); }

// ─── TOTP (RFC 6238 — pure crypto) ───────────────────────────────────────────

function base32Decode(encoded: string): Buffer {
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const str = encoded.toUpperCase().replace(/=+$/, '');
  const bytes: number[] = [];
  let bits = 0, val = 0;
  for (const ch of str) {
    const idx = ALPHA.indexOf(ch);
    if (idx < 0) continue;
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) { bytes.push((val >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return Buffer.from(bytes);
}

function hotp(secretBuf: Buffer, counter: number): string {
  const buf = Buffer.allocUnsafe(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const mac   = createHmac('sha1', secretBuf).update(buf).digest();
  const off   = mac[mac.length - 1] & 0x0f;
  const code  = ((mac[off] & 0x7f) << 24 | mac[off+1] << 16 | mac[off+2] << 8 | mac[off+3]) % 1_000_000;
  return String(code).padStart(6, '0');
}

export function generateTotpSecret(): string {
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = randomBytes(20);
  let result = '';
  for (const b of bytes) result += ALPHA[b & 31];
  return result;
}

export function verifyTotp(secret: string, token: string): boolean {
  const key    = base32Decode(secret);
  const window = Math.floor(Date.now() / 1000 / 30);
  for (let i = -1; i <= 1; i++) {
    if (hotp(key, window + i) === token) return true;
  }
  return false;
}

export function getTotpUri(secret: string, label: string): string {
  return `otpauth://totp/QQ-Guardian:${encodeURIComponent(label)}?secret=${secret}&issuer=QQ-Guardian`;
}

// ─── CSRF ─────────────────────────────────────────────────────────────────────
export function generateCsrfToken(): string { return randomBytes(24).toString('hex'); }
