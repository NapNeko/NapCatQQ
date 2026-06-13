import { getDatabase } from '../index.js';
import type { DbUser } from '../models/index.js';

export class UserRepository {
  findById(id: number): DbUser | null {
    return (getDatabase().prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser) ?? null;
  }

  findByUsername(username: string): DbUser | null {
    return (
      (getDatabase()
        .prepare('SELECT * FROM users WHERE username = ?')
        .get(username) as DbUser) ?? null
    );
  }

  findByQqId(qqId: number): DbUser | null {
    return (
      (getDatabase().prepare('SELECT * FROM users WHERE qq_id = ?').get(qqId) as DbUser) ?? null
    );
  }

  findAll(): DbUser[] {
    return getDatabase().prepare('SELECT * FROM users ORDER BY created_at DESC').all() as DbUser[];
  }

  create(data: {
    qqId?: number;
    username?: string;
    passwordHash?: string;
    role: DbUser['role'];
  }): DbUser {
    const now = Date.now();
    const result = getDatabase()
      .prepare(
        `INSERT INTO users (qq_id, username, password_hash, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(data.qqId ?? null, data.username ?? null, data.passwordHash ?? null, data.role, now, now);
    return this.findById(result.lastInsertRowid as number)!;
  }

  update(
    id: number,
    data: Partial<{
      passwordHash: string;
      role: DbUser['role'];
      totpSecret: string | null;
      totpEnabled: boolean;
      lastLogin: number;
      loginAttempts: number;
      lockedUntil: number | null;
    }>
  ): void {
    const sets: string[] = [];
    const vals: unknown[] = [];

    if (data.passwordHash !== undefined) { sets.push('password_hash = ?'); vals.push(data.passwordHash); }
    if (data.role !== undefined) { sets.push('role = ?'); vals.push(data.role); }
    if (data.totpSecret !== undefined) { sets.push('totp_secret = ?'); vals.push(data.totpSecret); }
    if (data.totpEnabled !== undefined) { sets.push('totp_enabled = ?'); vals.push(data.totpEnabled ? 1 : 0); }
    if (data.lastLogin !== undefined) { sets.push('last_login = ?'); vals.push(data.lastLogin); }
    if (data.loginAttempts !== undefined) { sets.push('login_attempts = ?'); vals.push(data.loginAttempts); }
    if (data.lockedUntil !== undefined) { sets.push('locked_until = ?'); vals.push(data.lockedUntil); }

    if (sets.length === 0) return;
    sets.push('updated_at = ?'); vals.push(Date.now());
    vals.push(id);

    getDatabase()
      .prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`)
      .run(...vals);
  }

  delete(id: number): void {
    getDatabase().prepare('DELETE FROM users WHERE id = ?').run(id);
  }

  incrementLoginAttempts(id: number): number {
    const user = this.findById(id);
    if (!user) return 0;
    const attempts = user.login_attempts + 1;
    this.update(id, { loginAttempts: attempts });
    return attempts;
  }

  resetLoginAttempts(id: number): void {
    this.update(id, { loginAttempts: 0, lockedUntil: null, lastLogin: Date.now() });
  }
}

export const userRepo = new UserRepository();
