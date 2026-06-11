var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/modules/captcha/service.ts
import { randomUUID } from "crypto";

// src/database/index.ts
import BetterSqlite3 from "better-sqlite3";
import { join } from "path";
import { mkdirSync } from "fs";

// src/database/migrations/001_initial.ts
var initial_exports = {};
__export(initial_exports, {
  description: () => description,
  down: () => down,
  up: () => up,
  version: () => version
});
var version = 1;
var description = "Initial schema";
function up(db) {
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
function down(db) {
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

// src/core/context/index.ts
var _ctx = null;
function setContext(ctx) {
  _ctx = ctx;
}
function clearContext() {
  _ctx = null;
}
function getCtx() {
  if (!_ctx) throw new Error("[qq-guardian] Context not initialized");
  return _ctx;
}
function tryGetCtx() {
  return _ctx;
}
async function callAction(action, params) {
  const ctx = getCtx();
  return ctx.actions.call(action, params, ctx.adapterName, ctx.pluginManager.config);
}

// src/core/logger/index.ts
function fmt(prefix, objOrMsg, msg) {
  if (msg) {
    const extra = typeof objOrMsg === "object" && objOrMsg !== null ? " " + JSON.stringify(objOrMsg) : "";
    return `[${prefix}] ${msg}${extra}`;
  }
  return `[${prefix}] ${typeof objOrMsg === "string" ? objOrMsg : JSON.stringify(objOrMsg)}`;
}
function makeLogger(prefix) {
  const write = (level, obj, msg) => {
    const text = fmt(prefix, obj, msg);
    const ctx = tryGetCtx();
    if (ctx) {
      ctx.logger[level](text);
    } else {
      console[level](text);
    }
  };
  return {
    info: (o, m) => write("info", o, m),
    warn: (o, m) => write("warn", o, m),
    error: (o, m) => write("error", o, m),
    debug: (o, m) => write("debug", o, m),
    child: (b) => makeLogger(b["module"] ? `${prefix}:${String(b["module"])}` : prefix)
  };
}
var _root = makeLogger("guardian");
function initLogger(_dataDir, _level) {
}
function getLogger() {
  return _root;
}

// src/database/migrations/index.ts
var MIGRATIONS = [initial_exports];
function runMigrations(db) {
  const log = getLogger().child({ module: "migrations" });
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);
  const appliedVersions = new Set(
    db.prepare("SELECT version FROM schema_migrations ORDER BY version").all().map((r) => r.version)
  );
  const pending = MIGRATIONS.filter((m) => !appliedVersions.has(m.version));
  if (pending.length === 0) {
    log.info("Database schema is up to date");
    return;
  }
  for (const migration of pending) {
    log.info({ version: migration.version }, `Applying migration: ${migration.description}`);
    const apply = db.transaction(() => {
      migration.up(db);
      db.prepare("INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)").run(
        migration.version,
        Date.now()
      );
    });
    apply();
    log.info({ version: migration.version }, "Migration applied");
  }
}

// src/database/index.ts
var DB_FILENAME = "qqadmin.db";
var _db = null;
function openDatabase(dataDir) {
  if (_db) return _db;
  mkdirSync(dataDir, { recursive: true });
  const dbPath = join(dataDir, DB_FILENAME);
  _db = new BetterSqlite3(dbPath);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  _db.pragma("busy_timeout = 5000");
  _db.pragma("synchronous = NORMAL");
  runMigrations(_db);
  getLogger().info({ path: dbPath }, "Database opened");
  return _db;
}
function getDatabase() {
  if (!_db) throw new Error("Database not initialized. Call openDatabase() first.");
  return _db;
}
function closeDatabase() {
  if (_db) {
    _db.close();
    _db = null;
    getLogger().info("Database closed");
  }
}

// src/database/repositories/approval.ts
var ApprovalRepository = class {
  findById(id) {
    return getDatabase().prepare("SELECT * FROM approval_records WHERE id = ?").get(id) ?? null;
  }
  findByFlag(flag) {
    return getDatabase().prepare("SELECT * FROM approval_records WHERE flag = ? ORDER BY created_at DESC LIMIT 1").get(flag) ?? null;
  }
  findPendingByUser(groupId, userId) {
    return getDatabase().prepare(
      `SELECT * FROM approval_records
           WHERE group_id = ? AND user_id = ? AND status IN ('pending','captcha')
           ORDER BY created_at DESC LIMIT 1`
    ).get(groupId, userId) ?? null;
  }
  findAllPending(limit = 50, offset = 0) {
    return getDatabase().prepare(
      `SELECT * FROM approval_records WHERE status IN ('pending','captcha')
         ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(limit, offset);
  }
  findByGroup(groupId, limit = 50, offset = 0) {
    return getDatabase().prepare(
      `SELECT * FROM approval_records WHERE group_id = ?
         ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(groupId, limit, offset);
  }
  create(data) {
    const now = Date.now();
    const result = getDatabase().prepare(
      `INSERT INTO approval_records
         (group_id, user_id, flag, comment, status, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.groupId,
      data.userId,
      data.flag,
      data.comment,
      data.status,
      now,
      now + data.ttlSeconds * 1e3
    );
    return this.findById(result.lastInsertRowid);
  }
  updateStatus(id, status, operatorId = null, reason = null, captchaId = null) {
    getDatabase().prepare(
      `UPDATE approval_records
         SET status = ?, operator_id = ?, reason = ?, captcha_id = ?, processed_at = ?
         WHERE id = ?`
    ).run(status, operatorId, reason, captchaId, Date.now(), id);
  }
  expireOldPending() {
    const result = getDatabase().prepare(
      `UPDATE approval_records SET status = 'expired', processed_at = ?
         WHERE status IN ('pending','captcha') AND expires_at < ?`
    ).run(Date.now(), Date.now());
    return result.changes;
  }
  countByStatus() {
    const rows = getDatabase().prepare("SELECT status, COUNT(*) as cnt FROM approval_records GROUP BY status").all();
    return Object.fromEntries(rows.map((r) => [r.status, r.cnt]));
  }
};
var approvalRepo = new ApprovalRepository();

// src/core/config/index.ts
import { readFileSync, writeFileSync, existsSync, mkdirSync as mkdirSync2, copyFileSync } from "fs";
import { join as join2 } from "path";

// src/core/config/defaults.ts
import { randomBytes } from "crypto";
function buildDefaults(dataDir) {
  return {
    core: {
      selfId: 0,
      managedGroups: [],
      superAdmins: [],
      dataDir,
      logLevel: "info"
    },
    webui: {
      enabled: true,
      host: "127.0.0.1",
      port: 3891,
      jwtSecret: randomBytes(32).toString("hex"),
      jwtExpiresIn: "2h",
      refreshExpiresIn: "7d"
    },
    approval: {
      defaultAction: "manual",
      groups: {},
      pendingTtlSeconds: 86400
      // 24h
    },
    captcha: {
      ttlSeconds: 300,
      maxAttempts: 3,
      types: ["math", "question"],
      questions: []
    },
    risk: {
      enabled: true,
      threshold: 70,
      action: "mute",
      muteDurationSeconds: 600,
      detectors: {
        advertising: true,
        fraud: true,
        grayMarket: true,
        pornography: true,
        political: true,
        gambling: true,
        shortLinks: true,
        duplicateMessages: true,
        spam: true,
        ocrViolation: false,
        aiViolation: false
      },
      weights: {}
    },
    punishment: {
      defaultMuteDurationSeconds: 600,
      escalateToKickAfter: 3,
      escalateToBlacklistAfter: 5
    },
    blacklist: {
      syncAcrossGroups: false,
      autoKickOnJoin: true
    },
    auth: {
      maxLoginAttempts: 5,
      lockoutSeconds: 900,
      requireTotpForHighRisk: false,
      rateLimitRequests: 100,
      rateLimitWindowMs: 6e4
    },
    monitor: {
      intervalMs: 3e4,
      diskAlertMb: 500,
      memoryAlertPercent: 90
    },
    update: {
      githubRepo: "ShiYuPIay/napcat-plugin-qq-guardian",
      autoCheckOnStartup: true,
      autoInstall: false
    },
    ai: {
      provider: "disabled",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "",
      model: "gpt-4o-mini",
      timeoutMs: 15e3,
      riskPrompt: 'Analyze the following QQ group message for risk. Respond with JSON: {"score":0-100,"reason":"...","tags":[]}. Score: 0=safe, 100=extremely harmful.'
    },
    ocr: {
      provider: "disabled",
      timeoutMs: 1e4
    }
  };
}

// src/events/index.ts
import { EventEmitter } from "events";
var TypedEventBus = class extends EventEmitter {
  constructor() {
    super();
    super.setMaxListeners(50);
  }
  emit(event, payload) {
    return super.emit(event, payload);
  }
  on(event, listener) {
    return super.on(event, listener);
  }
  once(event, listener) {
    return super.once(event, listener);
  }
  off(event, listener) {
    return super.off(event, listener);
  }
};
var bus = new TypedEventBus();

// src/core/config/index.ts
var CONFIG_FILE = "config.json";
var BACKUP_DIR = "config-backups";
var CURRENT_SCHEMA_VERSION = 1;
var ConfigManager = class {
  cfg;
  configPath;
  backupDir;
  init(configDir) {
    this.configPath = join2(configDir, CONFIG_FILE);
    this.backupDir = join2(configDir, BACKUP_DIR);
    mkdirSync2(this.backupDir, { recursive: true });
    if (existsSync(this.configPath)) {
      this.cfg = this.load();
    } else {
      this.cfg = buildDefaults(configDir);
      this.save();
    }
  }
  get() {
    return this.cfg;
  }
  update(partial) {
    const previous = JSON.stringify(this.cfg);
    this.cfg = deepMerge(this.cfg, partial);
    if (JSON.stringify(this.cfg) !== previous) {
      this.backup();
      this.save();
      bus.emit("ConfigChanged", { section: "config", timestamp: Date.now() });
    }
  }
  load() {
    const raw = readFileSync(this.configPath, "utf8");
    const parsed = JSON.parse(raw);
    return this.migrate(parsed);
  }
  save() {
    const file = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      config: this.cfg
    };
    writeFileSync(this.configPath, JSON.stringify(file, null, 2), "utf8");
  }
  backup() {
    if (!existsSync(this.configPath)) return;
    const ts = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const dest = join2(this.backupDir, `config-${ts}.json`);
    try {
      copyFileSync(this.configPath, dest);
    } catch {
    }
  }
  migrate(file) {
    const version2 = file.schemaVersion ?? 0;
    let cfg = file.config;
    if (version2 < 1) {
    }
    const defaults = buildDefaults(cfg?.core?.dataDir ?? ".");
    return deepMerge(defaults, cfg);
  }
};
function deepMerge(target, source) {
  if (source === null || source === void 0) return target;
  if (typeof source !== "object" || Array.isArray(source)) return source;
  if (typeof target !== "object" || Array.isArray(target)) return source;
  const result = { ...target };
  for (const [k, v] of Object.entries(source)) {
    result[k] = deepMerge(result[k], v);
  }
  return result;
}
var configManager = new ConfigManager();

// src/database/repositories/statistics.ts
var StatisticsRepository = class {
  todayPeriod() {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  ensureSnapshot(groupId, period) {
    getDatabase().prepare(
      `INSERT OR IGNORE INTO stat_snapshots
         (group_id, period, created_at)
         VALUES (?, ?, ?)`
    ).run(groupId, period, Date.now());
  }
  increment(groupId, field, amount = 1) {
    const period = this.todayPeriod();
    this.ensureSnapshot(groupId, period);
    getDatabase().prepare(
      `UPDATE stat_snapshots SET ${field} = ${field} + ?
         WHERE group_id ${groupId === null ? "IS NULL" : "= ?"} AND period = ?`
    ).run(...[amount, ...groupId !== null ? [groupId] : [], period]);
  }
  findByPeriod(period, groupId) {
    if (groupId !== void 0) {
      return getDatabase().prepare("SELECT * FROM stat_snapshots WHERE period = ? AND group_id = ?").all(period, groupId);
    }
    return getDatabase().prepare("SELECT * FROM stat_snapshots WHERE period = ?").all(period);
  }
  findRecent(days = 30, groupId) {
    const periods = Array.from({ length: days }, (_, i) => {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const placeholders = periods.map(() => "?").join(",");
    if (groupId !== void 0) {
      return getDatabase().prepare(
        `SELECT * FROM stat_snapshots
           WHERE period IN (${placeholders}) AND group_id = ?
           ORDER BY period DESC`
      ).all(...periods, groupId);
    }
    return getDatabase().prepare(
      `SELECT * FROM stat_snapshots
         WHERE period IN (${placeholders}) AND group_id IS NULL
         ORDER BY period DESC`
    ).all(...periods);
  }
  totals(groupId) {
    const where = groupId !== void 0 ? "WHERE group_id = ?" : "WHERE group_id IS NULL";
    const params = groupId !== void 0 ? [groupId] : [];
    const row = getDatabase().prepare(
      `SELECT
           SUM(approvals_total)    as approvals_total,
           SUM(approvals_passed)   as approvals_passed,
           SUM(approvals_rejected) as approvals_rejected,
           SUM(captchas_total)     as captchas_total,
           SUM(captchas_passed)    as captchas_passed,
           SUM(punishments_total)  as punishments_total,
           SUM(risk_detections)    as risk_detections
         FROM stat_snapshots ${where}`
    ).get(...params);
    return {
      approvals_total: row.approvals_total ?? 0,
      approvals_passed: row.approvals_passed ?? 0,
      approvals_rejected: row.approvals_rejected ?? 0,
      captchas_total: row.captchas_total ?? 0,
      captchas_passed: row.captchas_passed ?? 0,
      punishments_total: row.punishments_total ?? 0,
      risk_detections: row.risk_detections ?? 0
    };
  }
};
var statisticsRepo = new StatisticsRepository();

// src/database/repositories/blacklist.ts
var BlacklistRepository = class {
  isBlacklisted(userId, groupId = null) {
    const now = Date.now();
    const global = getDatabase().prepare(
      `SELECT 1 FROM blacklist
         WHERE user_id = ? AND group_id IS NULL
           AND (expires_at IS NULL OR expires_at > ?)
         LIMIT 1`
    ).get(userId, now);
    if (global) return true;
    if (groupId !== null) {
      const group = getDatabase().prepare(
        `SELECT 1 FROM blacklist
           WHERE user_id = ? AND group_id = ?
             AND (expires_at IS NULL OR expires_at > ?)
           LIMIT 1`
      ).get(userId, groupId, now);
      if (group) return true;
    }
    return false;
  }
  findByUser(userId) {
    return getDatabase().prepare("SELECT * FROM blacklist WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  }
  findAll(limit = 50, offset = 0) {
    return getDatabase().prepare("SELECT * FROM blacklist ORDER BY created_at DESC LIMIT ? OFFSET ?").all(limit, offset);
  }
  add(data) {
    const now = Date.now();
    const result = getDatabase().prepare(
      `INSERT INTO blacklist (user_id, group_id, reason, created_by, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, group_id) DO UPDATE SET
           reason = excluded.reason,
           created_by = excluded.created_by,
           created_at = excluded.created_at,
           expires_at = excluded.expires_at`
    ).run(data.userId, data.groupId, data.reason, data.createdBy, now, data.expiresAt ?? null);
    return getDatabase().prepare("SELECT * FROM blacklist WHERE id = ?").get(result.lastInsertRowid);
  }
  remove(userId, groupId = null) {
    const result = getDatabase().prepare(
      groupId === null ? "DELETE FROM blacklist WHERE user_id = ? AND group_id IS NULL" : "DELETE FROM blacklist WHERE user_id = ? AND group_id = ?"
    ).run(...[userId, ...groupId !== null ? [groupId] : []]);
    return result.changes > 0;
  }
  purgeExpired() {
    const result = getDatabase().prepare("DELETE FROM blacklist WHERE expires_at IS NOT NULL AND expires_at < ?").run(Date.now());
    return result.changes;
  }
};
var blacklistRepo = new BlacklistRepository();

// src/locks/index.ts
var _locks = /* @__PURE__ */ new Map();
async function withLock(name, fn) {
  while (_locks.has(name)) {
    await _locks.get(name);
  }
  let release;
  const lock = new Promise((resolve) => {
    release = resolve;
  });
  _locks.set(name, lock);
  try {
    return await fn();
  } finally {
    _locks.delete(name);
    release();
  }
}
var locks = {
  /** One approval action at a time per join-request flag */
  approval: (flag) => `approval:${flag}`,
  /** One punishment at a time per user-group pair */
  punishment: (groupId, userId) => `punishment:${groupId}:${userId}`,
  /** One update at a time globally */
  update: () => "update:global",
  /** One config write at a time */
  config: () => "config:write"
};

// src/modules/approval/service.ts
var ApprovalService = class {
  init() {
  }
  async handleJoinRequest(event) {
    if (event.request_type !== "group" || event.sub_type !== "add") return;
    const { group_id, user_id, flag, comment } = event;
    const cfg = configManager.get();
    const groupCfg = cfg.approval.groups[String(group_id)] ?? {
      action: cfg.approval.defaultAction,
      approveKeywords: [],
      rejectKeywords: [],
      approvePatterns: [],
      rejectPatterns: [],
      rejectReason: "Does not meet entry requirements"
    };
    if (blacklistRepo.isBlacklisted(user_id, group_id)) {
      await this._reject(flag, "You are on the group blacklist.", null);
      statisticsRepo.increment(group_id, "approvals_rejected");
      return;
    }
    statisticsRepo.increment(group_id, "approvals_total");
    statisticsRepo.increment(null, "approvals_total");
    const rejectReason = this._matchReject(comment ?? "", groupCfg);
    if (rejectReason) {
      const r = approvalRepo.create({ groupId: group_id, userId: user_id, flag, comment: comment ?? "", status: "rejected", ttlSeconds: cfg.approval.pendingTtlSeconds });
      approvalRepo.updateStatus(r.id, "rejected", null, rejectReason);
      await this._reject(flag, rejectReason, null);
      statisticsRepo.increment(group_id, "approvals_rejected");
      bus.emit("ApprovalRejected", { groupId: group_id, userId: user_id, flag, reason: rejectReason, operatorId: null, timestamp: Date.now() });
      return;
    }
    if (this._matchApprove(comment ?? "", groupCfg)) {
      const r = approvalRepo.create({ groupId: group_id, userId: user_id, flag, comment: comment ?? "", status: "approved", ttlSeconds: cfg.approval.pendingTtlSeconds });
      approvalRepo.updateStatus(r.id, "approved", null, null);
      await this._approve(flag, null);
      statisticsRepo.increment(group_id, "approvals_passed");
      bus.emit("ApprovalPassed", { groupId: group_id, userId: user_id, flag, operatorId: null, timestamp: Date.now() });
      return;
    }
    switch (groupCfg.action) {
      case "auto_approve":
        await this._autoApprove(group_id, user_id, flag, comment ?? "", cfg.approval.pendingTtlSeconds);
        break;
      case "auto_reject":
        await this._autoReject(group_id, user_id, flag, comment ?? "", groupCfg.rejectReason, cfg.approval.pendingTtlSeconds);
        break;
      case "captcha":
        await this._routeToCaptcha(group_id, user_id, flag, comment ?? "", cfg.approval.pendingTtlSeconds);
        break;
      default:
        approvalRepo.create({ groupId: group_id, userId: user_id, flag, comment: comment ?? "", status: "pending", ttlSeconds: cfg.approval.pendingTtlSeconds });
        getLogger().child({ module: "approval" }).info({ group_id, user_id }, "Queued for manual review");
    }
  }
  async approveManually(id, operatorId) {
    const rec = approvalRepo.findById(id);
    if (!rec || rec.status !== "pending") throw new Error("Invalid approval record");
    await withLock(locks.approval(rec.flag), async () => {
      await this._approve(rec.flag, operatorId);
      approvalRepo.updateStatus(id, "approved", operatorId, null);
      statisticsRepo.increment(rec.group_id, "approvals_passed");
      statisticsRepo.increment(null, "approvals_passed");
      bus.emit("ApprovalPassed", { groupId: rec.group_id, userId: rec.user_id, flag: rec.flag, operatorId, timestamp: Date.now() });
    });
  }
  async rejectManually(id, operatorId, reason) {
    const rec = approvalRepo.findById(id);
    if (!rec || rec.status !== "pending") throw new Error("Invalid approval record");
    await withLock(locks.approval(rec.flag), async () => {
      await this._reject(rec.flag, reason, operatorId);
      approvalRepo.updateStatus(id, "rejected", operatorId, reason);
      statisticsRepo.increment(rec.group_id, "approvals_rejected");
      statisticsRepo.increment(null, "approvals_rejected");
      bus.emit("ApprovalRejected", { groupId: rec.group_id, userId: rec.user_id, flag: rec.flag, reason, operatorId, timestamp: Date.now() });
    });
  }
  async approveAfterCaptcha(rec) {
    await withLock(locks.approval(rec.flag), async () => {
      await this._approve(rec.flag, null);
      approvalRepo.updateStatus(rec.id, "approved", null, "captcha_passed");
      statisticsRepo.increment(rec.group_id, "approvals_passed");
      statisticsRepo.increment(null, "approvals_passed");
      bus.emit("ApprovalPassed", { groupId: rec.group_id, userId: rec.user_id, flag: rec.flag, operatorId: null, timestamp: Date.now() });
    });
  }
  async rejectAfterCaptchaFail(rec, reason) {
    await withLock(locks.approval(rec.flag), async () => {
      await this._reject(rec.flag, reason, null);
      approvalRepo.updateStatus(rec.id, "rejected", null, reason);
      statisticsRepo.increment(rec.group_id, "approvals_rejected");
      statisticsRepo.increment(null, "approvals_rejected");
      bus.emit("ApprovalRejected", { groupId: rec.group_id, userId: rec.user_id, flag: rec.flag, reason, operatorId: null, timestamp: Date.now() });
    });
  }
  expirePendingRequests() {
    return approvalRepo.expireOldPending();
  }
  async _approve(flag, operatorId) {
    await callAction("set_group_add_request", { flag, sub_type: "add", approve: true });
    bus.emit("AuditCreated", { action: "approval.approve", actorId: operatorId, targetType: "approval", targetId: flag, details: { operatorId }, timestamp: Date.now() });
  }
  async _reject(flag, reason, operatorId) {
    await callAction("set_group_add_request", { flag, sub_type: "add", approve: false, reason });
    bus.emit("AuditCreated", { action: "approval.reject", actorId: operatorId, targetType: "approval", targetId: flag, details: { reason }, timestamp: Date.now() });
  }
  async _autoApprove(groupId, userId, flag, comment, ttl2) {
    const r = approvalRepo.create({ groupId, userId, flag, comment, status: "approved", ttlSeconds: ttl2 });
    approvalRepo.updateStatus(r.id, "approved", null, "auto_approved");
    await this._approve(flag, null);
    statisticsRepo.increment(groupId, "approvals_passed");
    bus.emit("ApprovalPassed", { groupId, userId, flag, operatorId: null, timestamp: Date.now() });
  }
  async _autoReject(groupId, userId, flag, comment, reason, ttl2) {
    const r = approvalRepo.create({ groupId, userId, flag, comment, status: "rejected", ttlSeconds: ttl2 });
    approvalRepo.updateStatus(r.id, "rejected", null, reason);
    await this._reject(flag, reason, null);
    statisticsRepo.increment(groupId, "approvals_rejected");
    bus.emit("ApprovalRejected", { groupId, userId, flag, reason, operatorId: null, timestamp: Date.now() });
  }
  async _routeToCaptcha(groupId, userId, flag, comment, ttl2) {
    const r = approvalRepo.create({ groupId, userId, flag, comment, status: "captcha", ttlSeconds: ttl2 });
    bus.emit("CaptchaRequired", { approvalId: r.id, groupId, userId, timestamp: Date.now() });
    getLogger().child({ module: "approval" }).info({ group_id: groupId, user_id: userId, approval_id: r.id }, "Routed to captcha");
  }
  _matchApprove(comment, cfg) {
    for (const kw of cfg.approveKeywords) if (comment.includes(kw)) return true;
    for (const p of cfg.approvePatterns) {
      try {
        if (new RegExp(p).test(comment)) return true;
      } catch {
      }
    }
    return false;
  }
  _matchReject(comment, cfg) {
    for (const kw of cfg.rejectKeywords) if (comment.includes(kw)) return cfg.rejectReason;
    for (const p of cfg.rejectPatterns) {
      try {
        if (new RegExp(p).test(comment)) return cfg.rejectReason;
      } catch {
      }
    }
    return null;
  }
};
var approvalService = new ApprovalService();

// src/modules/captcha/service.ts
var CaptchaService = class {
  init() {
    bus.on("CaptchaRequired", async (payload) => {
      await this.issueChallenge(payload.approvalId).catch(
        (e) => getLogger().child({ module: "captcha" }).error(e, "Failed to issue challenge")
      );
    });
  }
  async issueChallenge(approvalId) {
    const rec = approvalRepo.findById(approvalId);
    if (!rec || rec.status !== "captcha") return;
    const cfg = configManager.get().captcha;
    const type = cfg.types[Math.floor(Math.random() * cfg.types.length)] ?? "math";
    const { challenge, answer } = this._generate(type);
    const ttlMs = cfg.ttlSeconds * 1e3;
    const id = randomUUID();
    getDatabase().prepare(
      `INSERT INTO captcha_sessions (id, group_id, user_id, approval_id, type, challenge, answer, attempts, max_attempts, created_at, expires_at, solved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, rec.group_id, rec.user_id, approvalId, type, challenge, answer, 0, cfg.maxAttempts, Date.now(), Date.now() + ttlMs, 0);
    approvalRepo.updateStatus(approvalId, "captcha", null, null, id);
    statisticsRepo.increment(rec.group_id, "captchas_total");
    statisticsRepo.increment(null, "captchas_total");
    await callAction("send_private_msg", {
      user_id: String(rec.user_id),
      message: this._buildMsg(challenge, cfg.ttlSeconds)
    });
    getLogger().child({ module: "captcha" }).info({ session_id: id, user_id: rec.user_id }, "Captcha issued");
  }
  async handlePrivateMessage(event) {
    if (event.message_type !== "private") return false;
    const session = getDatabase().prepare(`SELECT * FROM captcha_sessions WHERE user_id = ? AND solved = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1`).get(event.user_id, Date.now());
    if (!session) return false;
    return this._processAnswer(session, event.raw_message.trim().toLowerCase());
  }
  expireAllStale() {
    const stale = getDatabase().prepare("SELECT * FROM captcha_sessions WHERE solved = 0 AND expires_at < ?").all(Date.now());
    for (const s of stale) this._expireSession(s).catch(() => {
    });
    return stale.length;
  }
  async _processAnswer(s, answer) {
    if (Date.now() > s.expires_at) {
      await this._expireSession(s);
      return true;
    }
    const newAttempts = s.attempts + 1;
    getDatabase().prepare("UPDATE captcha_sessions SET attempts = ? WHERE id = ?").run(newAttempts, s.id);
    if (answer === s.answer) {
      getDatabase().prepare("UPDATE captcha_sessions SET solved = ? WHERE id = ?").run(1, s.id);
      const rec = approvalRepo.findById(s.approval_id);
      if (rec) await approvalService.approveAfterCaptcha(rec);
      statisticsRepo.increment(s.group_id, "captchas_passed");
      statisticsRepo.increment(null, "captchas_passed");
      await callAction("send_private_msg", { user_id: String(s.user_id), message: "\u2705 Verification passed! Your join request has been approved." });
      bus.emit("CaptchaSuccess", { groupId: s.group_id, userId: s.user_id, captchaId: s.id, timestamp: Date.now() });
      return true;
    }
    const remaining = s.max_attempts - newAttempts;
    if (remaining <= 0) {
      await this._failSession(s, "Too many wrong attempts");
      return true;
    }
    await callAction("send_private_msg", { user_id: String(s.user_id), message: `\u274C Wrong answer. ${remaining} attempt(s) left.

${s.challenge}` });
    bus.emit("CaptchaFailed", { groupId: s.group_id, userId: s.user_id, captchaId: s.id, reason: "wrong_answer", timestamp: Date.now() });
    return true;
  }
  async _expireSession(s) {
    getDatabase().prepare("UPDATE captcha_sessions SET solved = ? WHERE id = ?").run(1, s.id);
    const rec = approvalRepo.findById(s.approval_id);
    if (rec) await approvalService.rejectAfterCaptchaFail(rec, "Captcha expired");
    await callAction("send_private_msg", { user_id: String(s.user_id), message: "\u23F0 Verification timed out. Your join request has been rejected." });
    bus.emit("CaptchaFailed", { groupId: s.group_id, userId: s.user_id, captchaId: s.id, reason: "expired", timestamp: Date.now() });
  }
  async _failSession(s, reason) {
    getDatabase().prepare("UPDATE captcha_sessions SET solved = ? WHERE id = ?").run(1, s.id);
    const rec = approvalRepo.findById(s.approval_id);
    if (rec) await approvalService.rejectAfterCaptchaFail(rec, reason);
    await callAction("send_private_msg", { user_id: String(s.user_id), message: `\u274C Verification failed: ${reason}. Your join request has been rejected.` });
    bus.emit("CaptchaFailed", { groupId: s.group_id, userId: s.user_id, captchaId: s.id, reason, timestamp: Date.now() });
  }
  _generate(type) {
    if (type === "question") {
      const qs = configManager.get().captcha.questions;
      if (qs.length > 0) {
        const q = qs[Math.floor(Math.random() * qs.length)];
        return { challenge: q.q, answer: q.a.toLowerCase() };
      }
    }
    if (type === "text") {
      const n = Math.floor(Math.random() * 9e3) + 1e3;
      return { challenge: `Please reply with the number: ${n}`, answer: String(n) };
    }
    const ops = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 20) + 1, b = Math.floor(Math.random() * 10) + 1;
    const res = op === "+" ? a + b : op === "-" ? a - b : a * b;
    return { challenge: `\u{1F522} Math verification: What is ${a} ${op} ${b}? Reply with the number only.`, answer: String(res) };
  }
  _buildMsg(challenge, ttlSeconds) {
    return `\u{1F44B} Welcome! Please complete verification to join.

${challenge}

\u23F1 You have ${Math.round(ttlSeconds / 60)} minute(s) to answer. Reply here.`;
  }
};
var captchaService = new CaptchaService();

// src/cache/index.ts
import { LRUCache } from "lru-cache";
var hot = /* @__PURE__ */ new Map();
var lru = new LRUCache({
  max: 2e3,
  ttl: 3e5
  // 5 min default TTL
});
var ttl = new LRUCache({
  max: 500,
  ttl: 6e4
  // 1 min default, overridden per entry
});
function hotSet(key, value) {
  hot.set(key, value);
}
function hotGet(key) {
  return hot.get(key);
}
function lruSet(key, value, ttlMs) {
  lru.set(key, value, ttlMs !== void 0 ? { ttl: ttlMs } : void 0);
}
function lruGet(key) {
  return lru.get(key);
}
function lruDelete(key) {
  lru.delete(key);
}
function ttlSet(key, value, expiresInMs) {
  ttl.set(key, value, { ttl: expiresInMs });
}
function ttlGet(key) {
  return ttl.get(key);
}
function ttlDelete(key) {
  ttl.delete(key);
}
var cache = {
  /** Permissions, config: never expire unless explicitly cleared */
  permissions: {
    set: (key, v) => hotSet(`perm:${key}`, v),
    get: (key) => hotGet(`perm:${key}`),
    clear: () => {
      for (const k of hot.keys()) if (k.startsWith("perm:")) hot.delete(k);
    }
  },
  /** Group info: LRU, 5 min TTL */
  groupInfo: {
    set: (groupId, v) => lruSet(`group:${groupId}`, v, 3e5),
    get: (groupId) => lruGet(`group:${groupId}`),
    clear: (groupId) => lruDelete(`group:${groupId}`)
  },
  /** Captcha sessions: TTL matching session TTL */
  captcha: {
    set: (id, v, ttlMs) => ttlSet(`cap:${id}`, v, ttlMs),
    get: (id) => ttlGet(`cap:${id}`),
    clear: (id) => ttlDelete(`cap:${id}`)
  },
  /** OCR results: 10 min TTL */
  ocr: {
    set: (hash, v) => ttlSet(`ocr:${hash}`, v, 6e5),
    get: (hash) => ttlGet(`ocr:${hash}`)
  },
  /** AI risk results: 10 min TTL */
  aiRisk: {
    set: (hash, v) => ttlSet(`ai:${hash}`, v, 6e5),
    get: (hash) => ttlGet(`ai:${hash}`)
  }
};

// src/database/repositories/punishment.ts
var PunishmentRepository = class {
  findById(id) {
    return getDatabase().prepare("SELECT * FROM punishment_records WHERE id = ?").get(id) ?? null;
  }
  findByUser(userId, groupId) {
    if (groupId !== void 0) {
      return getDatabase().prepare(
        "SELECT * FROM punishment_records WHERE user_id = ? AND group_id = ? ORDER BY created_at DESC"
      ).all(userId, groupId);
    }
    return getDatabase().prepare("SELECT * FROM punishment_records WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  }
  findByGroup(groupId, limit = 50, offset = 0) {
    return getDatabase().prepare(
      "SELECT * FROM punishment_records WHERE group_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).all(groupId, limit, offset);
  }
  findAll(limit = 50, offset = 0) {
    return getDatabase().prepare("SELECT * FROM punishment_records ORDER BY created_at DESC LIMIT ? OFFSET ?").all(limit, offset);
  }
  countByUser(userId, groupId) {
    const row = getDatabase().prepare(
      "SELECT COUNT(*) as cnt FROM punishment_records WHERE user_id = ? AND group_id = ? AND revoked_at IS NULL"
    ).get(userId, groupId);
    return row.cnt;
  }
  create(data) {
    const now = Date.now();
    const expiresAt = data.durationSeconds !== null ? now + data.durationSeconds * 1e3 : null;
    const result = getDatabase().prepare(
      `INSERT INTO punishment_records
         (group_id, user_id, type, duration_seconds, reason, operator_id, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.groupId,
      data.userId,
      data.type,
      data.durationSeconds,
      data.reason,
      data.operatorId,
      now,
      expiresAt
    );
    return this.findById(result.lastInsertRowid);
  }
  revoke(id, revokedBy) {
    getDatabase().prepare(
      "UPDATE punishment_records SET revoked_at = ?, revoked_by = ? WHERE id = ?"
    ).run(Date.now(), revokedBy, id);
  }
};
var punishmentRepo = new PunishmentRepository();

// src/modules/punishment/service.ts
var PunishmentService = class {
  init() {
  }
  async mute(groupId, userId, durationSeconds, reason, operatorId) {
    return withLock(locks.punishment(groupId, userId), async () => {
      const r = punishmentRepo.create({ groupId, userId, type: "mute", durationSeconds, reason, operatorId });
      await callAction("set_group_ban", { group_id: String(groupId), user_id: String(userId), duration: durationSeconds });
      statisticsRepo.increment(groupId, "punishments_total");
      statisticsRepo.increment(null, "punishments_total");
      bus.emit("PunishmentCreated", { groupId, userId, type: "mute", duration: durationSeconds, reason, operatorId, timestamp: Date.now() });
      bus.emit("UserBanned", { groupId, userId, duration: durationSeconds, reason, timestamp: Date.now() });
      bus.emit("AuditCreated", { action: "punishment.mute", actorId: operatorId, targetType: "user", targetId: String(userId), details: { groupId, durationSeconds, reason }, timestamp: Date.now() });
      await this._checkEscalation(groupId, userId, operatorId);
      return r;
    });
  }
  async kick(groupId, userId, reason, operatorId, rejectFuture = false) {
    return withLock(locks.punishment(groupId, userId), async () => {
      const r = punishmentRepo.create({ groupId, userId, type: "kick", durationSeconds: null, reason, operatorId });
      await callAction("set_group_kick", { group_id: String(groupId), user_id: String(userId), reject_add_request: rejectFuture });
      statisticsRepo.increment(groupId, "punishments_total");
      statisticsRepo.increment(null, "punishments_total");
      bus.emit("PunishmentCreated", { groupId, userId, type: "kick", duration: null, reason, operatorId, timestamp: Date.now() });
      bus.emit("AuditCreated", { action: "punishment.kick", actorId: operatorId, targetType: "user", targetId: String(userId), details: { groupId, reason }, timestamp: Date.now() });
      await this._checkEscalation(groupId, userId, operatorId);
      return r;
    });
  }
  async unban(groupId, userId, operatorId) {
    await callAction("set_group_ban", { group_id: String(groupId), user_id: String(userId), duration: 0 });
    bus.emit("UserUnbanned", { groupId, userId, operatorId, timestamp: Date.now() });
    bus.emit("AuditCreated", { action: "punishment.unban", actorId: operatorId, targetType: "user", targetId: String(userId), details: { groupId }, timestamp: Date.now() });
  }
  async revoke(punishmentId, operatorId) {
    const r = punishmentRepo.findById(punishmentId);
    if (!r) throw new Error(`Punishment ${punishmentId} not found`);
    punishmentRepo.revoke(punishmentId, operatorId);
    if (r.type === "mute") await this.unban(r.group_id, r.user_id, operatorId);
  }
  async _checkEscalation(groupId, userId, operatorId) {
    const cfg = configManager.get().punishment;
    const count = punishmentRepo.countByUser(userId, groupId);
    const log = getLogger().child({ module: "punishment" });
    if (count >= cfg.escalateToBlacklistAfter && !blacklistRepo.isBlacklisted(userId, groupId)) {
      blacklistRepo.add({ userId, groupId, reason: `Auto-blacklisted after ${count} punishments`, createdBy: operatorId });
      log.warn({ user_id: userId, group_id: groupId }, "Escalated to blacklist");
      bus.emit("AuditCreated", { action: "blacklist.auto_add", actorId: operatorId, targetType: "user", targetId: String(userId), details: { groupId, count }, timestamp: Date.now() });
    } else if (count >= cfg.escalateToKickAfter) {
      const kicks = punishmentRepo.findByUser(userId, groupId).filter((r) => r.type === "kick");
      if (kicks.length < cfg.escalateToKickAfter) {
        log.warn({ user_id: userId, group_id: groupId }, "Escalated to kick");
        await this.kick(groupId, userId, `Auto-kicked after ${count} punishments`, operatorId);
      }
    }
  }
};
var punishmentService = new PunishmentService();

// src/providers/index.ts
var DisabledAI = class {
  async analyzeRisk() {
    return { ok: false, error: "AI provider is disabled" };
  }
};
var OpenAICompatibleAI = class {
  async analyzeRisk(text) {
    const cfg = configManager.get().ai;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
    try {
      const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`
        },
        body: JSON.stringify({
          model: cfg.model,
          messages: [
            { role: "system", content: cfg.riskPrompt },
            { role: "user", content: text }
          ],
          response_format: { type: "json_object" },
          max_tokens: 200
        }),
        signal: controller.signal
      });
      if (!res.ok) return { ok: false, error: `AI HTTP ${res.status}` };
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(content);
      return {
        ok: true,
        data: {
          score: Math.min(100, Math.max(0, parsed.score ?? 0)),
          reason: parsed.reason ?? "",
          tags: parsed.tags ?? []
        }
      };
    } catch (err) {
      return { ok: false, error: String(err) };
    } finally {
      clearTimeout(timer);
    }
  }
};
function createAIProvider() {
  const cfg = configManager.get().ai;
  switch (cfg.provider) {
    case "openai":
    case "anthropic":
    case "custom":
      return new OpenAICompatibleAI();
    case "disabled":
    default:
      return new DisabledAI();
  }
}

// src/modules/risk/service.ts
import { createHash } from "crypto";
var BUILTIN = {
  advertising: [/加(?:我|微信|QQ|群)[：:，, ]*[\w@]+/i, /(?:推广|代理|招商|佣金|返利)/, /(?:私信|私聊)我/],
  fraud: [/(?:兼职|日结|月薪|年薪)\s*[\d万]+/, /(?:刷单|刷流水|点赞赚钱)/, /(?:免费领取|限时领取)/],
  grayMarket: [/(?:发票|洗钱|代开|空壳)/, /(?:非法|违禁品|走私)/],
  pornography: [/(?:约炮|约P|开房|一夜情)/i, /(?:裸聊|色情|黄片)/i],
  political: [/(?:推翻|颠覆|政权|敏感政治)/],
  gambling: [/(?:赌博|博彩|百家乐|老虎机|彩票代购)/, /(?:下注|押注|赌场)/],
  shortLinks: [/(?:t\.cn|suo\.im|dwz\.cn|bit\.ly|tinyurl)\//],
  spam: [/(.{5,})\1{3,}/]
};
var RiskService = class {
  recentMsgs = /* @__PURE__ */ new Map();
  init() {
  }
  async handleGroupMessage(event) {
    const cfg = configManager.get().risk;
    if (!cfg.enabled) return;
    const score = await this._score(event.raw_message, event.group_id, event.user_id);
    if (score < cfg.threshold) return;
    const log = getLogger().child({ module: "risk" });
    log.warn({ group_id: event.group_id, user_id: event.user_id, score }, "Risk detected");
    statisticsRepo.increment(event.group_id, "risk_detections");
    statisticsRepo.increment(null, "risk_detections");
    bus.emit("RiskDetected", { groupId: event.group_id, userId: event.user_id, messageId: event.message_id, riskType: "risk", score, timestamp: Date.now() });
    const selfId = configManager.get().core.selfId;
    switch (cfg.action) {
      case "mute":
        await punishmentService.mute(event.group_id, event.user_id, cfg.muteDurationSeconds, `Risk score ${score}`, selfId);
        break;
      case "kick":
        await punishmentService.kick(event.group_id, event.user_id, `Risk score ${score}`, selfId);
        break;
      case "notify_admin":
        for (const id of configManager.get().core.superAdmins) {
          await callAction("send_private_msg", { user_id: String(id), message: `\u26A0\uFE0F Risk in group ${event.group_id}: user ${event.user_id}, score ${score}
${event.raw_message.slice(0, 100)}` }).catch(() => {
          });
        }
        break;
    }
  }
  reloadRules() {
    const rules = getDatabase().prepare("SELECT * FROM risk_rules WHERE enabled = 1").all();
    cache.permissions.set("risk_rules", rules);
  }
  addRule(data) {
    const now = Date.now();
    const r = getDatabase().prepare(`INSERT INTO risk_rules (name, type, pattern, weight, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)`).run(data.name, data.type, data.pattern, data.weight, now, now);
    this.reloadRules();
    return getDatabase().prepare("SELECT * FROM risk_rules WHERE id = ?").get(r.lastInsertRowid);
  }
  toggleRule(id, enabled) {
    getDatabase().prepare("UPDATE risk_rules SET enabled = ?, updated_at = ? WHERE id = ?").run(enabled ? 1 : 0, Date.now(), id);
    this.reloadRules();
  }
  async _score(text, groupId, userId) {
    const cfg = configManager.get().risk;
    let score = 0;
    for (const [name, patterns] of Object.entries(BUILTIN)) {
      if (!cfg.detectors[name]) continue;
      const w = cfg.weights[name] ?? 1;
      for (const re of patterns) {
        if (re.test(text)) {
          score += 30 * w;
          break;
        }
      }
    }
    if (cfg.detectors.duplicateMessages) {
      const key = `${userId}:${groupId}`;
      const now = Date.now();
      const ts = (this.recentMsgs.get(key) ?? []).filter((t) => now - t < 1e4);
      ts.push(now);
      this.recentMsgs.set(key, ts);
      if (ts.length >= 5) score += 40;
    }
    const rules = cache.permissions.get("risk_rules") ?? [];
    for (const rule of rules) {
      try {
        if (new RegExp(rule.pattern).test(text)) score += 30 * rule.weight;
      } catch {
      }
    }
    if (cfg.detectors.aiViolation && score < cfg.threshold) {
      const hash = createHash("md5").update(text).digest("hex");
      const cached = cache.aiRisk.get(hash);
      if (cached) {
        score += cached.score * 0.5;
      } else {
        const r = await createAIProvider().analyzeRisk(text);
        if (r.ok && r.data) {
          cache.aiRisk.set(hash, r.data);
          score += r.data.score * 0.5;
        }
      }
    }
    return Math.min(100, Math.round(score));
  }
};
var riskService = new RiskService();

// src/handlers/message.ts
async function plugin_onmessage(_ctx2, event) {
  try {
    if (event.message_type === "private") {
      await captchaService.handlePrivateMessage(event);
      return;
    }
    if (event.message_type === "group") {
      await riskService.handleGroupMessage(event);
      return;
    }
  } catch (e) {
    getLogger().child({ module: "message" }).error(e, "Error handling message");
  }
}

// src/modules/blacklist/index.ts
function initBlacklistModule() {
  bus.on("UserJoined", async (payload) => {
    if (!configManager.get().blacklist.autoKickOnJoin) return;
    if (blacklistRepo.isBlacklisted(payload.userId, payload.groupId)) {
      getLogger().child({ module: "blacklist" }).info(
        { user_id: payload.userId, group_id: payload.groupId },
        "Auto-kicking blacklisted user"
      );
      await punishmentService.kick(
        payload.groupId,
        payload.userId,
        "Blacklisted user",
        configManager.get().core.selfId
      );
    }
  });
}
function handleGroupIncrease(event) {
  bus.emit("UserJoined", {
    groupId: event.group_id,
    userId: event.user_id,
    subType: event.sub_type ?? "approve",
    timestamp: event.time * 1e3
  });
}

// src/handlers/event.ts
async function plugin_onevent(_ctx2, event) {
  try {
    if (event.post_type === "request" && event.request_type === "group" && event.sub_type === "add") {
      await approvalService.handleJoinRequest(event);
      return;
    }
    if (event.post_type === "notice" && event.notice_type === "group_increase") {
      handleGroupIncrease(event);
      return;
    }
  } catch (e) {
    getLogger().child({ module: "event" }).error(e, "Error handling event");
  }
}

// src/core/lifecycle/index.ts
import { join as join4 } from "path";
import { readFileSync as readFileSync2, existsSync as existsSync3, mkdirSync as mkdirSync4 } from "fs";

// src/database/repositories/audit.ts
var AuditRepository = class {
  log(data) {
    getDatabase().prepare(
      `INSERT INTO audit_logs (action, actor_id, target_type, target_id, details, ip, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.action,
      data.actorId ?? null,
      data.targetType ?? null,
      data.targetId ?? null,
      JSON.stringify(data.details ?? {}),
      data.ip ?? null,
      Date.now()
    );
  }
  findAll(opts = {}) {
    const { action, actorId, limit = 50, offset = 0 } = opts;
    const where = [];
    const vals = [];
    if (action) {
      where.push("action = ?");
      vals.push(action);
    }
    if (actorId !== void 0) {
      where.push("actor_id = ?");
      vals.push(actorId);
    }
    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    vals.push(limit, offset);
    return getDatabase().prepare(`SELECT * FROM audit_logs ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...vals);
  }
  logLogin(data) {
    getDatabase().prepare(
      `INSERT INTO login_logs (user_id, ip, user_agent, success, created_at)
         VALUES (?, ?, ?, ?, ?)`
    ).run(data.userId, data.ip, data.userAgent ?? null, data.success ? 1 : 0, Date.now());
  }
  findLoginLogs(userId, limit = 20) {
    return getDatabase().prepare("SELECT * FROM login_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?").all(userId, limit);
  }
  pruneOlderThan(days) {
    const cutoff = Date.now() - days * 86400 * 1e3;
    const r1 = getDatabase().prepare("DELETE FROM audit_logs WHERE created_at < ?").run(cutoff);
    const r2 = getDatabase().prepare("DELETE FROM login_logs WHERE created_at < ?").run(cutoff);
    return r1.changes + r2.changes;
  }
};
var auditRepo = new AuditRepository();

// src/modules/audit/index.ts
function initAuditModule() {
  bus.on("AuditCreated", (payload) => {
    auditRepo.log({
      action: payload.action,
      actorId: payload.actorId ?? void 0,
      targetType: payload.targetType ?? void 0,
      targetId: payload.targetId ?? void 0,
      details: payload.details
    });
  });
}

// src/modules/statistics/index.ts
var _timer = null;
function initStatisticsModule() {
  ensureTodaySnapshot();
  _timer = setInterval(ensureTodaySnapshot, 36e5);
}
function stopStatisticsModule() {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
  }
}
function ensureTodaySnapshot() {
  try {
    const expired = approvalRepo.expireOldPending();
    if (expired > 0) {
      getLogger().child({ module: "statistics" }).debug({ expired }, "Expired pending approval requests");
    }
  } catch (err) {
    getLogger().child({ module: "statistics" }).error(err, "Statistics snapshot error");
  }
}
function getOverviewStats() {
  return {
    totals: statisticsRepo.totals(),
    approvalCounts: approvalRepo.countByStatus(),
    recent30Days: statisticsRepo.findRecent(30)
  };
}

// src/modules/monitor/index.ts
import { freemem, totalmem } from "os";
import { statfsSync } from "fs";
var _timer2 = null;
var _lastStatus = buildEmpty();
function buildEmpty() {
  return { healthy: true, timestamp: 0, components: {} };
}
function initMonitorModule() {
  const cfg = configManager.get().monitor;
  runChecks();
  _timer2 = setInterval(runChecks, cfg.intervalMs);
}
function stopMonitorModule() {
  if (_timer2) {
    clearInterval(_timer2);
    _timer2 = null;
  }
}
function getLastHealthStatus() {
  return _lastStatus;
}
function runChecks() {
  const cfg = configManager.get().monitor;
  const components = {};
  try {
    getDatabase().prepare("SELECT 1").get();
    components["database"] = { status: "ok" };
  } catch (err) {
    components["database"] = { status: "error", message: String(err) };
  }
  try {
    const free = freemem();
    const total = totalmem();
    const usedPercent = Math.round((total - free) / total * 100);
    components["memory"] = {
      status: usedPercent > cfg.memoryAlertPercent ? "warn" : "ok",
      detail: { usedPercent, freeMb: Math.round(free / 1024 / 1024) }
    };
  } catch {
    components["memory"] = { status: "error", message: "Could not read memory stats" };
  }
  try {
    const dataDir = configManager.get().core.dataDir;
    const stats = statfsSync(dataDir);
    const freeMb = Math.round(stats.bfree * stats.bsize / 1024 / 1024);
    components["disk"] = {
      status: freeMb < cfg.diskAlertMb ? "warn" : "ok",
      detail: { freeMb }
    };
  } catch {
    components["disk"] = { status: "error", message: "Could not read disk stats" };
  }
  const allOk = Object.values(components).every((c) => c.status === "ok");
  const anyError = Object.values(components).some((c) => c.status === "error");
  _lastStatus = {
    healthy: !anyError,
    timestamp: Date.now(),
    components
  };
  if (!allOk) {
    getLogger().child({ module: "monitor" }).warn({ components }, "Health check warning");
  }
}

// src/core/auth/index.ts
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
async function hashPassword(plain) {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1
  });
}

// src/database/repositories/user.ts
var UserRepository = class {
  findById(id) {
    return getDatabase().prepare("SELECT * FROM users WHERE id = ?").get(id) ?? null;
  }
  findByUsername(username) {
    return getDatabase().prepare("SELECT * FROM users WHERE username = ?").get(username) ?? null;
  }
  findByQqId(qqId) {
    return getDatabase().prepare("SELECT * FROM users WHERE qq_id = ?").get(qqId) ?? null;
  }
  findAll() {
    return getDatabase().prepare("SELECT * FROM users ORDER BY created_at DESC").all();
  }
  create(data) {
    const now = Date.now();
    const result = getDatabase().prepare(
      `INSERT INTO users (qq_id, username, password_hash, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
    ).run(data.qqId ?? null, data.username ?? null, data.passwordHash ?? null, data.role, now, now);
    return this.findById(result.lastInsertRowid);
  }
  update(id, data) {
    const sets = [];
    const vals = [];
    if (data.passwordHash !== void 0) {
      sets.push("password_hash = ?");
      vals.push(data.passwordHash);
    }
    if (data.role !== void 0) {
      sets.push("role = ?");
      vals.push(data.role);
    }
    if (data.totpSecret !== void 0) {
      sets.push("totp_secret = ?");
      vals.push(data.totpSecret);
    }
    if (data.totpEnabled !== void 0) {
      sets.push("totp_enabled = ?");
      vals.push(data.totpEnabled ? 1 : 0);
    }
    if (data.lastLogin !== void 0) {
      sets.push("last_login = ?");
      vals.push(data.lastLogin);
    }
    if (data.loginAttempts !== void 0) {
      sets.push("login_attempts = ?");
      vals.push(data.loginAttempts);
    }
    if (data.lockedUntil !== void 0) {
      sets.push("locked_until = ?");
      vals.push(data.lockedUntil);
    }
    if (sets.length === 0) return;
    sets.push("updated_at = ?");
    vals.push(Date.now());
    vals.push(id);
    getDatabase().prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  }
  delete(id) {
    getDatabase().prepare("DELETE FROM users WHERE id = ?").run(id);
  }
  incrementLoginAttempts(id) {
    const user = this.findById(id);
    if (!user) return 0;
    const attempts = user.login_attempts + 1;
    this.update(id, { loginAttempts: attempts });
    return attempts;
  }
  resetLoginAttempts(id) {
    this.update(id, { loginAttempts: 0, lockedUntil: null, lastLogin: Date.now() });
  }
};
var userRepo = new UserRepository();

// src/modules/auth/index.ts
async function createUser(data) {
  const hash = await hashPassword(data.password);
  return userRepo.create({
    username: data.username,
    passwordHash: hash,
    role: data.role,
    qqId: data.qqId
  });
}
async function ensureDefaultAdmin() {
  const existing = userRepo.findAll().find((u) => u.role === "super_admin");
  if (!existing) {
    await createUser({
      username: "admin",
      password: "admin@guardian2024",
      role: "super_admin"
    });
  }
}

// src/modules/update/index.ts
import { createWriteStream, mkdirSync as mkdirSync3 } from "fs";
import { join as join3 } from "path";
var _currentVersion = "1.0.0";
function setCurrentVersion(v) {
  _currentVersion = v;
}
function getCurrentVersion() {
  return _currentVersion;
}
async function checkForUpdate() {
  const cfg = configManager.get().update;
  const log = getLogger().child({ module: "update" });
  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.githubRepo}/releases/latest`,
      { headers: { Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(1e4) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const latest = data.tag_name?.replace(/^v/, "") ?? "";
    if (!latest || !isNewerVersion(latest, _currentVersion)) return null;
    const zipAsset = data.assets?.find((a) => a.name.endsWith(".zip"));
    if (!zipAsset) return null;
    return {
      version: latest,
      publishedAt: data.published_at ?? "",
      downloadUrl: zipAsset.browser_download_url,
      releaseNotes: data.body ?? ""
    };
  } catch (err) {
    log.error(err, "Failed to check for updates");
    return null;
  }
}
async function applyUpdate(info) {
  return withLock(locks.update(), async () => {
    const log = getLogger().child({ module: "update" });
    const cfg = configManager.get().core;
    const backupDir = join3(cfg.dataDir, "backups");
    mkdirSync3(backupDir, { recursive: true });
    log.info({ version: info.version }, "Applying update");
    const tmpPath = join3(backupDir, `update-${info.version}.zip`);
    const res = await fetch(info.downloadUrl, { signal: AbortSignal.timeout(12e4) });
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const writer = createWriteStream(tmpPath);
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      writer.write(value);
    }
    await new Promise((resolve, reject) => {
      writer.end();
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
    log.info({ version: info.version }, "Update downloaded, restart required to apply");
    bus.emit("PluginUpdated", {
      fromVersion: _currentVersion,
      toVersion: info.version,
      timestamp: Date.now()
    });
    bus.emit("AuditCreated", {
      action: "plugin.update",
      actorId: null,
      targetType: "plugin",
      targetId: "qq-guardian",
      details: { fromVersion: _currentVersion, toVersion: info.version },
      timestamp: Date.now()
    });
    _currentVersion = info.version;
  });
}
function isNewerVersion(latest, current) {
  const parse = (v) => v.split(".").map((n) => parseInt(n, 10));
  const [lMaj, lMin, lPat] = parse(latest);
  const [cMaj, cMin, cPat] = parse(current);
  if (lMaj !== cMaj) return lMaj > cMaj;
  if (lMin !== cMin) return lMin > cMin;
  return lPat > cPat;
}

// src/shared/api/rest/index.ts
function wrap(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e) });
    }
  };
}
var ok = (res, data = {}) => res.json({ ok: true, data });
var bad = (res, code, error) => res.status(code).json({ ok: false, error });
function registerRoutes() {
  const ctx = getCtx();
  const r = ctx.router;
  r.get("/stats", wrap((_req, res) => ok(res, getOverviewStats())));
  r.get("/metrics", wrap((_req, res) => ok(res, getLastHealthStatus())));
  r.get("/approvals", wrap((req, res) => {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    ok(res, approvalRepo.findAllPending(limit, offset));
  }));
  r.post("/approvals/:id/approve", wrap(async (req, res) => {
    const b = req.body;
    await approvalService.approveManually(Number(req.params["id"]), Number(b["operatorId"] ?? 0));
    ok(res);
  }));
  r.post("/approvals/:id/reject", wrap(async (req, res) => {
    const b = req.body;
    await approvalService.rejectManually(
      Number(req.params["id"]),
      Number(b["operatorId"] ?? 0),
      String(b["reason"] ?? "Rejected by admin")
    );
    ok(res);
  }));
  r.get("/blacklist", wrap((req, res) => {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    ok(res, blacklistRepo.findAll(limit, offset));
  }));
  r.post("/blacklist", wrap((req, res) => {
    const b = req.body;
    if (!b["userId"]) return bad(res, 400, "userId required");
    ok(res, blacklistRepo.add({
      userId: Number(b["userId"]),
      groupId: b["groupId"] ? Number(b["groupId"]) : null,
      reason: String(b["reason"] ?? ""),
      createdBy: Number(b["createdBy"] ?? 0)
    }));
  }));
  r.delete("/blacklist/:userId", wrap((req, res) => {
    const gid = req.query["groupId"] ? Number(req.query["groupId"]) : null;
    blacklistRepo.remove(Number(req.params["userId"]), gid);
    ok(res);
  }));
  r.get("/punishments", wrap((req, res) => {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    ok(res, punishmentRepo.findAll(limit, offset));
  }));
  r.post("/punishments/mute", wrap(async (req, res) => {
    const b = req.body;
    ok(res, await punishmentService.mute(
      Number(b["groupId"]),
      Number(b["userId"]),
      Number(b["durationSeconds"] ?? 600),
      String(b["reason"] ?? ""),
      Number(b["operatorId"] ?? 0)
    ));
  }));
  r.post("/punishments/kick", wrap(async (req, res) => {
    const b = req.body;
    ok(res, await punishmentService.kick(
      Number(b["groupId"]),
      Number(b["userId"]),
      String(b["reason"] ?? ""),
      Number(b["operatorId"] ?? 0)
    ));
  }));
  r.post("/punishments/:id/revoke", wrap(async (req, res) => {
    const b = req.body;
    await punishmentService.revoke(Number(req.params["id"]), Number(b["operatorId"] ?? 0));
    ok(res);
  }));
  r.get("/risk/rules", wrap(
    (_req, res) => ok(res, getDatabase().prepare("SELECT * FROM risk_rules ORDER BY created_at DESC").all())
  ));
  r.post("/risk/rules", wrap((req, res) => {
    const b = req.body;
    ok(res, riskService.addRule({
      name: String(b["name"]),
      type: String(b["type"]),
      pattern: String(b["pattern"]),
      weight: Number(b["weight"] ?? 1)
    }));
  }));
  r.post("/risk/rules/:id/toggle", wrap((req, res) => {
    const b = req.body;
    riskService.toggleRule(Number(req.params["id"]), Boolean(b["enabled"]));
    ok(res);
  }));
  r.get("/audit", wrap((req, res) => {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const offset = Number(req.query["offset"] ?? 0);
    ok(res, auditRepo.findAll({ limit, offset }));
  }));
  r.get("/config", wrap((_req, res) => {
    const cfg = JSON.parse(JSON.stringify(configManager.get()));
    cfg.webui = { ...cfg.webui ?? {}, jwtSecret: "[redacted]" };
    ok(res, cfg);
  }));
  r.post("/config", wrap((req, res) => {
    configManager.update(req.body);
    ok(res);
  }));
  r.get("/users", wrap(
    (_req, res) => ok(res, userRepo.findAll().map(({ password_hash: _ph, totp_secret: _ts, ...u }) => u))
  ));
  r.get("/update/check", wrap(
    async (_req, res) => ok(res, { current: getCurrentVersion(), latest: await checkForUpdate() })
  ));
  r.post("/update/apply", wrap(async (req, res) => {
    await applyUpdate(req.body);
    ok(res);
  }));
}

// src/core/lifecycle/index.ts
var _state = "idle";
function readPackageVersion(pluginPath) {
  try {
    const p = join4(pluginPath, "package.json");
    if (existsSync3(p)) {
      return JSON.parse(readFileSync2(p, "utf8")).version ?? "1.0.0";
    }
  } catch {
  }
  return "1.0.0";
}
async function boot(ctx) {
  if (_state === "running") return;
  setContext(ctx);
  const { dataPath, configPath, pluginPath } = ctx;
  for (const d of [dataPath, join4(dataPath, "logs"), join4(dataPath, "backups"), configPath]) {
    mkdirSync4(d, { recursive: true });
  }
  configManager.init(configPath);
  const cfg = configManager.get();
  initLogger(dataPath, cfg.core.logLevel);
  const log = getLogger().child({ module: "lifecycle" });
  log.info("Plugin booting\u2026");
  openDatabase(dataPath);
  log.info("Database ready");
  initAuditModule();
  initBlacklistModule();
  initStatisticsModule();
  initMonitorModule();
  approvalService.init();
  captchaService.init();
  punishmentService.init();
  riskService.init();
  riskService.reloadRules();
  await ensureDefaultAdmin();
  const wuiDir = join4(pluginPath, "dist", "webui");
  if (existsSync3(wuiDir)) {
    ctx.router.static("/static", join4(pluginPath, "dist", "webui"));
    ctx.router.page({
      path: "guardian",
      title: "QQ Guardian",
      icon: "\u{1F6E1}\uFE0F",
      htmlFile: join4(pluginPath, "dist", "webui", "index.html"),
      description: "QQ Group Guardian management panel"
    });
    log.info("WebUI registered via ctx.router");
  }
  registerRoutes();
  log.info("API routes registered");
  const version2 = readPackageVersion(pluginPath);
  setCurrentVersion(version2);
  if (cfg.update.autoCheckOnStartup) {
    checkForUpdate().then((info) => {
      if (info) log.info({ version: info.version }, "Update available");
    }).catch(() => {
    });
  }
  _state = "running";
  log.info({ version: version2 }, "Plugin boot complete \u2713");
}
async function teardown() {
  if (_state !== "running") return;
  const log = getLogger().child({ module: "lifecycle" });
  log.info("Plugin tearing down\u2026");
  stopMonitorModule();
  stopStatisticsModule();
  closeDatabase();
  clearContext();
  _state = "idle";
  log.info("Plugin teardown complete");
}

// src/index.ts
async function plugin_init(ctx) {
  await boot(ctx);
}
async function plugin_cleanup(ctx) {
  await teardown();
}
export {
  plugin_cleanup,
  plugin_init,
  plugin_onevent,
  plugin_onmessage
};
//# sourceMappingURL=index.mjs.map
