import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  revokeToken,
  generateTotpSecret,
  verifyTotp,
  getTotpUri,
  type JWTPayload,
} from '../../core/auth/index.js';
import { userRepo } from '../../database/repositories/user.js';
import { auditRepo } from '../../database/repositories/audit.js';
import { configManager } from '../../core/config/index.js';
import type { DbUser } from '../../database/models/index.js';

export type { JWTPayload };

export type AuthRole = DbUser['role'];

const ROLE_RANK: Record<AuthRole, number> = {
  super_admin: 5,
  group_admin: 4,
  auditor: 3,
  viewer: 2,
  member: 1,
};

export function hasRole(userRole: AuthRole, required: AuthRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[required];
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginResult {
  ok: boolean;
  error?: string;
  needsTotp?: boolean;
  accessToken?: string;
  refreshToken?: string;
}

export async function login(
  username: string,
  password: string,
  totpToken: string | undefined,
  ip: string,
  userAgent?: string
): Promise<LoginResult> {
  const cfg = configManager.get().auth;
  const user = userRepo.findByUsername(username);

  if (!user || !user.password_hash) {
    return { ok: false, error: 'Invalid credentials' };
  }

  // Lockout check
  if (user.locked_until && Date.now() < user.locked_until) {
    return { ok: false, error: 'Account temporarily locked' };
  }

  const valid = await verifyPassword(user.password_hash, password);
  if (!valid) {
    const attempts = userRepo.incrementLoginAttempts(user.id);
    auditRepo.logLogin({ userId: user.id, ip, userAgent, success: false });
    if (attempts >= cfg.maxLoginAttempts) {
      userRepo.update(user.id, { lockedUntil: Date.now() + cfg.lockoutSeconds * 1000 });
      return { ok: false, error: 'Account locked due to too many failed attempts' };
    }
    return { ok: false, error: 'Invalid credentials' };
  }

  // TOTP check
  if (user.totp_enabled && user.totp_secret) {
    if (!totpToken) return { ok: false, needsTotp: true, error: 'TOTP required' };
    if (!verifyTotp(user.totp_secret, totpToken)) {
      auditRepo.logLogin({ userId: user.id, ip, userAgent, success: false });
      return { ok: false, error: 'Invalid TOTP code' };
    }
  }

  userRepo.resetLoginAttempts(user.id);
  auditRepo.logLogin({ userId: user.id, ip, userAgent, success: true });

  const payload: JWTPayload = { sub: user.id, role: user.role };
  return {
    ok: true,
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: user.id }),
  };
}

export function refreshAccessToken(refreshToken: string): string | null {
  const payload = verifyToken(refreshToken);
  if (!payload) return null;
  const user = userRepo.findById(payload.sub);
  if (!user) return null;
  return signAccessToken({ sub: user.id, role: user.role });
}

export function logout(token: string): void {
  revokeToken(token);
}

// ─── User management ──────────────────────────────────────────────────────────

export async function createUser(data: {
  username: string;
  password: string;
  role: AuthRole;
  qqId?: number;
}): Promise<DbUser> {
  const hash = await hashPassword(data.password);
  return userRepo.create({
    username: data.username,
    passwordHash: hash,
    role: data.role,
    qqId: data.qqId,
  });
}

export async function changePassword(
  userId: number,
  newPassword: string
): Promise<void> {
  const hash = await hashPassword(newPassword);
  userRepo.update(userId, { passwordHash: hash });
}

// ─── TOTP management ──────────────────────────────────────────────────────────

export function initTotp(userId: number): { secret: string; uri: string } {
  const user = userRepo.findById(userId);
  if (!user) throw new Error('User not found');
  const secret = generateTotpSecret();
  userRepo.update(userId, { totpSecret: secret, totpEnabled: false });
  return { secret, uri: getTotpUri(secret, user.username ?? String(user.qq_id)) };
}

export function confirmTotp(userId: number, token: string): boolean {
  const user = userRepo.findById(userId);
  if (!user?.totp_secret) return false;
  if (!verifyTotp(user.totp_secret, token)) return false;
  userRepo.update(userId, { totpEnabled: true });
  return true;
}

export function disableTotp(userId: number): void {
  userRepo.update(userId, { totpSecret: null, totpEnabled: false });
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

/**
 * Ensure at least one super_admin account exists.
 * Creates default admin if table is empty.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  const existing = userRepo.findAll().find((u) => u.role === 'super_admin');
  if (!existing) {
    await createUser({
      username: 'admin',
      password: 'admin@guardian2024',
      role: 'super_admin',
    });
  }
}
