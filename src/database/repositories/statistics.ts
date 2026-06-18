import { getDatabase } from '../index.js';
import type { DbStatSnapshot } from '../models/index.js';

type StatField = keyof Omit<DbStatSnapshot, 'id' | 'group_id' | 'period' | 'created_at'>;

export class StatisticsRepository {
  private todayPeriod(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private ensureSnapshot(groupId: number | null, period: string): void {
    // INSERT OR IGNORE relies on the UNIQUE(group_id, period) constraint, but
    // SQLite treats NULL != NULL, so it never deduplicates rows where groupId
    // is null. Use an explicit SELECT-then-INSERT instead for the null case.
    const db = getDatabase();
    const existing =
      groupId === null
        ? db.prepare('SELECT 1 FROM stat_snapshots WHERE group_id IS NULL AND period = ?').get(period)
        : db.prepare('SELECT 1 FROM stat_snapshots WHERE group_id = ? AND period = ?').get(groupId, period);

    if (!existing) {
      db.prepare(
        `INSERT INTO stat_snapshots (group_id, period, created_at) VALUES (?, ?, ?)`
      ).run(groupId, period, Date.now());
    }
  }

  increment(groupId: number | null, field: StatField, amount = 1): void {
    const period = this.todayPeriod();
    this.ensureSnapshot(groupId, period);
    getDatabase()
      .prepare(
        `UPDATE stat_snapshots SET ${field} = ${field} + ?
         WHERE group_id ${groupId === null ? 'IS NULL' : '= ?'} AND period = ?`
      )
      .run(...([amount, ...(groupId !== null ? [groupId] : []), period] as unknown[]));
  }

  findByPeriod(period: string, groupId?: number): DbStatSnapshot[] {
    if (groupId !== undefined) {
      return getDatabase()
        .prepare('SELECT * FROM stat_snapshots WHERE period = ? AND group_id = ?')
        .all(period, groupId) as DbStatSnapshot[];
    }
    return getDatabase()
      .prepare('SELECT * FROM stat_snapshots WHERE period = ?')
      .all(period) as DbStatSnapshot[];
  }

  findRecent(days = 30, groupId?: number): DbStatSnapshot[] {
    const periods = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const placeholders = periods.map(() => '?').join(',');

    if (groupId !== undefined) {
      return getDatabase()
        .prepare(
          `SELECT * FROM stat_snapshots
           WHERE period IN (${placeholders}) AND group_id = ?
           ORDER BY period DESC`
        )
        .all(...periods, groupId) as DbStatSnapshot[];
    }
    return getDatabase()
      .prepare(
        `SELECT * FROM stat_snapshots
         WHERE period IN (${placeholders}) AND group_id IS NULL
         ORDER BY period DESC`
      )
      .all(...periods) as DbStatSnapshot[];
  }

  totals(groupId?: number): Record<StatField, number> {
    const where = groupId !== undefined ? 'WHERE group_id = ?' : 'WHERE group_id IS NULL';
    const params = groupId !== undefined ? [groupId] : [];
    const row = getDatabase()
      .prepare(
        `SELECT
           SUM(approvals_total)    as approvals_total,
           SUM(approvals_passed)   as approvals_passed,
           SUM(approvals_rejected) as approvals_rejected,
           SUM(captchas_total)     as captchas_total,
           SUM(captchas_passed)    as captchas_passed,
           SUM(punishments_total)  as punishments_total,
           SUM(risk_detections)    as risk_detections
         FROM stat_snapshots ${where}`
      )
      .get(...params) as Record<StatField, number | null>;

    return {
      approvals_total: row.approvals_total ?? 0,
      approvals_passed: row.approvals_passed ?? 0,
      approvals_rejected: row.approvals_rejected ?? 0,
      captchas_total: row.captchas_total ?? 0,
      captchas_passed: row.captchas_passed ?? 0,
      punishments_total: row.punishments_total ?? 0,
      risk_detections: row.risk_detections ?? 0,
    };
  }
}

export const statisticsRepo = new StatisticsRepository();
