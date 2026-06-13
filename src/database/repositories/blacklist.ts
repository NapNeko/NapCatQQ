import { getDatabase } from '../index.js';
import type { DbBlacklistEntry } from '../models/index.js';

export class BlacklistRepository {
  isBlacklisted(userId: number, groupId: number | null = null): boolean {
    const now = Date.now();
    // Check global blacklist
    const global = getDatabase()
      .prepare(
        `SELECT 1 FROM blacklist
         WHERE user_id = ? AND group_id IS NULL
           AND (expires_at IS NULL OR expires_at > ?)
         LIMIT 1`
      )
      .get(userId, now);
    if (global) return true;

    if (groupId !== null) {
      const group = getDatabase()
        .prepare(
          `SELECT 1 FROM blacklist
           WHERE user_id = ? AND group_id = ?
             AND (expires_at IS NULL OR expires_at > ?)
           LIMIT 1`
        )
        .get(userId, groupId, now);
      if (group) return true;
    }
    return false;
  }

  findByUser(userId: number): DbBlacklistEntry[] {
    return getDatabase()
      .prepare('SELECT * FROM blacklist WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as DbBlacklistEntry[];
  }

  findAll(limit = 50, offset = 0): DbBlacklistEntry[] {
    return getDatabase()
      .prepare('SELECT * FROM blacklist ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(limit, offset) as DbBlacklistEntry[];
  }

  add(data: {
    userId: number;
    groupId: number | null;
    reason: string;
    createdBy: number;
    expiresAt?: number;
  }): DbBlacklistEntry {
    const now = Date.now();
    const result = getDatabase()
      .prepare(
        `INSERT INTO blacklist (user_id, group_id, reason, created_by, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, group_id) DO UPDATE SET
           reason = excluded.reason,
           created_by = excluded.created_by,
           created_at = excluded.created_at,
           expires_at = excluded.expires_at`
      )
      .run(data.userId, data.groupId, data.reason, data.createdBy, now, data.expiresAt ?? null);

    return getDatabase()
      .prepare('SELECT * FROM blacklist WHERE id = ?')
      .get(result.lastInsertRowid as number) as DbBlacklistEntry;
  }

  remove(userId: number, groupId: number | null = null): boolean {
    const result = getDatabase()
      .prepare(
        groupId === null
          ? 'DELETE FROM blacklist WHERE user_id = ? AND group_id IS NULL'
          : 'DELETE FROM blacklist WHERE user_id = ? AND group_id = ?'
      )
      .run(...([userId, ...(groupId !== null ? [groupId] : [])] as unknown[]));
    return result.changes > 0;
  }

  purgeExpired(): number {
    const result = getDatabase()
      .prepare('DELETE FROM blacklist WHERE expires_at IS NOT NULL AND expires_at < ?')
      .run(Date.now());
    return result.changes;
  }
}

export const blacklistRepo = new BlacklistRepository();
