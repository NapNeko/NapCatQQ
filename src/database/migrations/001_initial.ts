import { DatabaseSync } from 'node:sqlite';

export const version = 1;
export const description = 'Initial schema';

export function up(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version   INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      qq_id          INTEGER UNIQUE,
      username       TEXT UNIQUE,
      password_hash  TEXT,
      role           TEXT NOT NULL DEFAULT 'member',
      totp_secret    TEXT,
      totp_enabled   INTEGER NOT NULL DEFAULT 0,
      login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until   INTEGER,
      last_login     INTEGER,
      created_at     INTEGER NOT NULL,
      updated_at     INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS approval_records (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id     INTEGER NOT NULL,
      user_id      INTEGER NOT NULL,
      flag         TEXT NOT NULL,
      comment      TEXT NOT NULL DEFAULT '',
      status       TEXT NOT NULL DEFAULT 'pending',
      reason       TEXT,
      operator_id  INTEGER,
      captcha_id   TEXT,
      created_at   INTEGER NOT NULL,
      processed_at INTEGER,
      expires_at   INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_records(status);
    CREATE INDEX IF NOT EXISTS idx_approval_user   ON approval_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_approval_group  ON approval_records(group_id);

    CREATE TABLE IF NOT EXISTS captcha_sessions (
      id           TEXT PRIMARY KEY,
      group_id     INTEGER NOT NULL,
      user_id      INTEGER NOT NULL,
      approval_id  INTEGER NOT NULL,
      type         TEXT NOT NULL,
      challenge    TEXT NOT NULL,
      answer       TEXT NOT NULL,
      attempts     INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      created_at   INTEGER NOT NULL,
      expires_at   INTEGER NOT NULL,
      solved       INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS blacklist (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      group_id   INTEGER,
      reason     TEXT NOT NULL DEFAULT '',
      created_by INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER,
      UNIQUE(user_id, group_id)
    );

    CREATE INDEX IF NOT EXISTS idx_blacklist_user  ON blacklist(user_id);
    CREATE INDEX IF NOT EXISTS idx_blacklist_group ON blacklist(group_id);

    CREATE TABLE IF NOT EXISTS punishment_records (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id         INTEGER NOT NULL,
      user_id          INTEGER NOT NULL,
      type             TEXT NOT NULL,
      duration_seconds INTEGER,
      reason           TEXT NOT NULL DEFAULT '',
      operator_id      INTEGER NOT NULL,
      created_at       INTEGER NOT NULL,
      expires_at       INTEGER,
      revoked_at       INTEGER,
      revoked_by       INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_punishment_user  ON punishment_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_punishment_group ON punishment_records(group_id);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      action      TEXT NOT NULL,
      actor_id    INTEGER,
      target_type TEXT,
      target_id   TEXT,
      details     TEXT NOT NULL DEFAULT '{}',
      ip          TEXT,
      created_at  INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
    CREATE INDEX IF NOT EXISTS idx_audit_actor  ON audit_logs(actor_id);
    CREATE INDEX IF NOT EXISTS idx_audit_time   ON audit_logs(created_at);

    CREATE TABLE IF NOT EXISTS login_logs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      ip         TEXT NOT NULL,
      user_agent TEXT,
      success    INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stat_snapshots (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id            INTEGER,
      period              TEXT NOT NULL,
      approvals_total     INTEGER NOT NULL DEFAULT 0,
      approvals_passed    INTEGER NOT NULL DEFAULT 0,
      approvals_rejected  INTEGER NOT NULL DEFAULT 0,
      captchas_total      INTEGER NOT NULL DEFAULT 0,
      captchas_passed     INTEGER NOT NULL DEFAULT 0,
      punishments_total   INTEGER NOT NULL DEFAULT 0,
      risk_detections     INTEGER NOT NULL DEFAULT 0,
      created_at          INTEGER NOT NULL,
      UNIQUE(group_id, period)
    );

    CREATE TABLE IF NOT EXISTS risk_rules (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      type       TEXT NOT NULL,
      pattern    TEXT NOT NULL,
      weight     REAL NOT NULL DEFAULT 1.0,
      enabled    INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

export function down(db: DatabaseSync): void {
  db.exec(`
    DROP TABLE IF EXISTS risk_rules;
    DROP TABLE IF EXISTS stat_snapshots;
    DROP TABLE IF EXISTS login_logs;
    DROP TABLE IF EXISTS audit_logs;
    DROP TABLE IF EXISTS punishment_records;
    DROP TABLE IF EXISTS blacklist;
    DROP TABLE IF EXISTS captcha_sessions;
    DROP TABLE IF EXISTS approval_records;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS schema_migrations;
  `);
}
