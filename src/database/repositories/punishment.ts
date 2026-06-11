import { getDatabase } from '../index.js';
import type { DbPunishmentRecord } from '../models/index.js';

export class PunishmentRepository {
  findById(id: number): DbPunishmentRecord | null {
    return (
      (getDatabase()
        .prepare('SELECT * FROM punishment_records WHERE id = ?')
        .get(id) as DbPunishmentRecord) ?? null
    );
  }

  findByUser(userId: number, groupId?: number): DbPunishmentRecord[] {
    if (groupId !== undefined) {
      return getDatabase()
        .prepare(
          'SELECT * FROM punishment_records WHERE user_id = ? AND group_id = ? ORDER BY created_at DESC'
        )
        .all(userId, groupId) as DbPunishmentRecord[];
    }
    return getDatabase()
      .prepare('SELECT * FROM punishment_records WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as DbPunishmentRecord[];
  }

  findByGroup(groupId: number, limit = 50, offset = 0): DbPunishmentRecord[] {
    return getDatabase()
      .prepare(
        'SELECT * FROM punishment_records WHERE group_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
      )
      .all(groupId, limit, offset) as DbPunishmentRecord[];
  }

  findAll(limit = 50, offset = 0): DbPunishmentRecord[] {
    return getDatabase()
      .prepare('SELECT * FROM punishment_records ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(limit, offset) as DbPunishmentRecord[];
  }

  countByUser(userId: number, groupId: number): number {
    const row = getDatabase()
      .prepare(
        'SELECT COUNT(*) as cnt FROM punishment_records WHERE user_id = ? AND group_id = ? AND revoked_at IS NULL'
      )
      .get(userId, groupId) as { cnt: number };
    return row.cnt;
  }

  create(data: {
    groupId: number;
    userId: number;
    type: DbPunishmentRecord['type'];
    durationSeconds: number | null;
    reason: string;
    operatorId: number;
  }): DbPunishmentRecord {
    const now = Date.now();
    const expiresAt =
      data.durationSeconds !== null ? now + data.durationSeconds * 1000 : null;
    const result = getDatabase()
      .prepare(
        `INSERT INTO punishment_records
         (group_id, user_id, type, duration_seconds, reason, operator_id, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.groupId,
        data.userId,
        data.type,
        data.durationSeconds,
        data.reason,
        data.operatorId,
        now,
        expiresAt
      );
    return this.findById(result.lastInsertRowid as number)!;
  }

  revoke(id: number, revokedBy: number): void {
    getDatabase()
      .prepare(
        'UPDATE punishment_records SET revoked_at = ?, revoked_by = ? WHERE id = ?'
      )
      .run(Date.now(), revokedBy, id);
  }
}

export const punishmentRepo = new PunishmentRepository();
