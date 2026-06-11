import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { randomBytes } from 'crypto';
import { configManager } from '../config/index.js';

// ─── Password hashing ─────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export interface JWTPayload {
  sub: number;   // user DB id
  role: string;
  iat?: number;
  exp?: number;
}

const jwtBlacklist = new Set<string>();

export function signAccessToken(payload: JWTPayload): string {
  const cfg = configManager.get().webui;
  return jwt.sign(payload, cfg.jwtSecret, { expiresIn: cfg.jwtExpiresIn } as jwt.SignOptions);
}

export function signRefreshToken(payload: Pick<JWTPayload, 'sub'>): string {
  const cfg = configManager.get().webui;
  return jwt.sign(payload, cfg.jwtSecret, { expiresIn: cfg.refreshExpiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  if (jwtBlacklist.has(token)) return null;
  try {
    return jwt.verify(token, configManager.get().webui.jwtSecret) as JWTPayload;
  } catch {
    return null;
  }
}

export function revokeToken(token: string): void {
  jwtBlacklist.add(token);
}

// ─── TOTP ─────────────────────────────────────────────────────────────────────

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTotp(secret: string, token: string): boolean {
  return authenticator.verify({ token, secret });
}

export function getTotpUri(secret: string, userLabel: string): string {
  return authenticator.keyuri(userLabel, 'QQ-Guardian', secret);
}

// ─── CSRF ─────────────────────────────────────────────────────────────────────

export function generateCsrfToken(): string {
  return randomBytes(24).toString('hex');
}
