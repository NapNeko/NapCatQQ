import { getDatabase } from '../index.js';
import type { DbApprovalRecord } from '../models/index.js';

export class ApprovalRepository {
  findById(id: number): DbApprovalRecord | null {
    return (
      (getDatabase()
        .prepare('SELECT * FROM approval_records WHERE id = ?')
        .get(id) as DbApprovalRecord) ?? null
    );
  }

  findByFlag(flag: string): DbApprovalRecord | null {
    return (
      (getDatabase()
        .prepare('SELECT * FROM approval_records WHERE flag = ? ORDER BY created_at DESC LIMIT 1')
        .get(flag) as DbApprovalRecord) ?? null
    );
  }

  findPendingByUser(groupId: number, userId: number): DbApprovalRecord | null {
    return (
      (getDatabase()
        .prepare(
          `SELECT * FROM approval_records
           WHERE group_id = ? AND user_id = ? AND status IN ('pending','captcha')
           ORDER BY created_at DESC LIMIT 1`
        )
        .get(groupId, userId) as DbApprovalRecord) ?? null
    );
  }

  findAllPending(limit = 50, offset = 0): DbApprovalRecord[] {
    return getDatabase()
      .prepare(
        `SELECT * FROM approval_records WHERE status IN ('pending','captcha')
         ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .all(limit, offset) as DbApprovalRecord[];
  }

  findByGroup(groupId: number, limit = 50, offset = 0): DbApprovalRecord[] {
    return getDatabase()
      .prepare(
        `SELECT * FROM approval_records WHERE group_id = ?
         ORDER BY created_at DESC LIMIT ? OFFSET ?`
      )
      .all(groupId, limit, offset) as DbApprovalRecord[];
  }

  create(data: {
    groupId: number;
    userId: number;
    flag: string;
    comment: string;
    status: DbApprovalRecord['status'];
    ttlSeconds: number;
  }): DbApprovalRecord {
    const now = Date.now();
    const result = getDatabase()
      .prepare(
        `INSERT INTO approval_records
         (group_id, user_id, flag, comment, status, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.groupId,
        data.userId,
        data.flag,
        data.comment,
        data.status,
        now,
        now + data.ttlSeconds * 1000
      );
    return this.findById(result.lastInsertRowid as number)!;
  }

  updateStatus(
    id: number,
    status: DbApprovalRecord['status'],
    operatorId: number | null = null,
    reason: string | null = null,
    captchaId: string | null = null
  ): void {
    getDatabase()
      .prepare(
        `UPDATE approval_records
         SET status = ?, operator_id = ?, reason = ?, captcha_id = ?, processed_at = ?
         WHERE id = ?`
      )
      .run(status, operatorId, reason, captchaId, Date.now(), id);
  }

  expireOldPending(): number {
    const result = getDatabase()
      .prepare(
        `UPDATE approval_records SET status = 'expired', processed_at = ?
         WHERE status IN ('pending','captcha') AND expires_at < ?`
      )
      .run(Date.now(), Date.now());
    return result.changes;
  }

  countByStatus(): Record<string, number> {
    const rows = getDatabase()
      .prepare('SELECT status, COUNT(*) as cnt FROM approval_records GROUP BY status')
      .all() as Array<{ status: string; cnt: number }>;
    return Object.fromEntries(rows.map((r) => [r.status, r.cnt]));
  }
}

export const approvalRepo = new ApprovalRepository();
