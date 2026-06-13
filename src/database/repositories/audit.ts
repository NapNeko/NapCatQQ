import { getDatabase } from '../index.js';
import type { DbAuditLog, DbLoginLog } from '../models/index.js';

export class AuditRepository {
  log(data: {
    action: string;
    actorId?: number;
    targetType?: string;
    targetId?: string;
    details?: Record<string, unknown>;
    ip?: string;
  }): void {
    getDatabase()
      .prepare(
        `INSERT INTO audit_logs (action, actor_id, target_type, target_id, details, ip, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.action,
        data.actorId ?? null,
        data.targetType ?? null,
        data.targetId ?? null,
        JSON.stringify(data.details ?? {}),
        data.ip ?? null,
        Date.now()
      );
  }

  findAll(
    opts: { action?: string; actorId?: number; limit?: number; offset?: number } = {}
  ): DbAuditLog[] {
    const { action, actorId, limit = 50, offset = 0 } = opts;
    const where: string[] = [];
    const vals: unknown[] = [];

    if (action) { where.push('action = ?'); vals.push(action); }
    if (actorId !== undefined) { where.push('actor_id = ?'); vals.push(actorId); }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    vals.push(limit, offset);

    return getDatabase()
      .prepare(`SELECT * FROM audit_logs ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...(vals as unknown[])) as DbAuditLog[];
  }

  logLogin(data: { userId: number; ip: string; userAgent?: string; success: boolean }): void {
    getDatabase()
      .prepare(
        `INSERT INTO login_logs (user_id, ip, user_agent, success, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(data.userId, data.ip, data.userAgent ?? null, data.success ? 1 : 0, Date.now());
  }

  findLoginLogs(userId: number, limit = 20): DbLoginLog[] {
    return getDatabase()
      .prepare('SELECT * FROM login_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
      .all(userId, limit) as DbLoginLog[];
  }

  pruneOlderThan(days: number): number {
    const cutoff = Date.now() - days * 86400 * 1000;
    const r1 = getDatabase().prepare('DELETE FROM audit_logs WHERE created_at < ?').run(cutoff);
    const r2 = getDatabase().prepare('DELETE FROM login_logs WHERE created_at < ?').run(cutoff);
    return r1.changes + r2.changes;
  }
}

export const auditRepo = new AuditRepository();
