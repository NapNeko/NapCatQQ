/**
 * REST API routes registered via ctx.router.
 * All routes are authenticated via NapCat's built-in auth.
 * Prefix: /api/Plugin/ext/napcat-plugin-qq-guardian/
 */
import { getCtx } from '../../../core/context/index.js';
import { approvalRepo } from '../../../database/repositories/approval.js';
import { blacklistRepo } from '../../../database/repositories/blacklist.js';
import { punishmentRepo } from '../../../database/repositories/punishment.js';
import { auditRepo } from '../../../database/repositories/audit.js';
import { userRepo } from '../../../database/repositories/user.js';
import { statisticsRepo } from '../../../database/repositories/statistics.js';
import { approvalService } from '../../../modules/approval/service.js';
import { punishmentService } from '../../../modules/punishment/service.js';
import { riskService } from '../../../modules/risk/service.js';
import { configManager } from '../../../core/config/index.js';
import { getLastHealthStatus } from '../../../modules/monitor/index.js';
import { getOverviewStats } from '../../../modules/statistics/index.js';
import { checkForUpdate, applyUpdate, getCurrentVersion } from '../../../modules/update/index.js';
import { getDatabase } from '../../../database/index.js';
import type { DbRiskRule } from '../../../database/models/index.js';
import type { PluginHttpRequest, PluginHttpResponse } from '../../../types/napcat.js';

type H = (req: PluginHttpRequest, res: PluginHttpResponse) => void | Promise<void>;

// Tiny helper so we don't repeat try/catch on every handler
function wrap(fn: H): H {
  return async (req, res) => {
    try { await fn(req, res); }
    catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
  };
}

const ok  = (res: PluginHttpResponse, data: unknown = {}) => res.json({ ok: true, data });
const bad = (res: PluginHttpResponse, code: number, error: string) => res.status(code).json({ ok: false, error });

export function registerRoutes(): void {
  const ctx = getCtx();
  const r   = ctx.router;

  // ── Stats / health ──────────────────────────────────────────────────────────
  r.get('/stats',   wrap((_req, res) => ok(res, getOverviewStats())));
  r.get('/metrics', wrap((_req, res) => ok(res, getLastHealthStatus())));

  // ── Approvals ───────────────────────────────────────────────────────────────
  r.get('/approvals', wrap((req, res) => {
    const limit  = Math.min(Number(req.query['limit']  ?? 50), 200);
    const offset = Number(req.query['offset'] ?? 0);
    ok(res, approvalRepo.findAllPending(limit, offset));
  }));

  r.post('/approvals/:id/approve', wrap(async (req, res) => {
    const b = req.body as Record<string, unknown>;
    await approvalService.approveManually(Number(req.params['id']), Number(b['operatorId'] ?? 0));
    ok(res);
  }));

  r.post('/approvals/:id/reject', wrap(async (req, res) => {
    const b = req.body as Record<string, unknown>;
    await approvalService.rejectManually(
      Number(req.params['id']), Number(b['operatorId'] ?? 0),
      String(b['reason'] ?? 'Rejected by admin')
    );
    ok(res);
  }));

  // ── Blacklist ───────────────────────────────────────────────────────────────
  r.get('/blacklist', wrap((req, res) => {
    const limit  = Math.min(Number(req.query['limit']  ?? 50), 200);
    const offset = Number(req.query['offset'] ?? 0);
    ok(res, blacklistRepo.findAll(limit, offset));
  }));

  r.post('/blacklist', wrap((req, res) => {
    const b = req.body as Record<string, unknown>;
    if (!b['userId']) return bad(res, 400, 'userId required');
    ok(res, blacklistRepo.add({
      userId:    Number(b['userId']),
      groupId:   b['groupId'] ? Number(b['groupId']) : null,
      reason:    String(b['reason'] ?? ''),
      createdBy: Number(b['createdBy'] ?? 0),
    }));
  }));

  r.delete('/blacklist/:userId', wrap((req, res) => {
    const gid = req.query['groupId'] ? Number(req.query['groupId']) : null;
    blacklistRepo.remove(Number(req.params['userId']), gid);
    ok(res);
  }));

  // ── Punishments ─────────────────────────────────────────────────────────────
  r.get('/punishments', wrap((req, res) => {
    const limit  = Math.min(Number(req.query['limit']  ?? 50), 200);
    const offset = Number(req.query['offset'] ?? 0);
    ok(res, punishmentRepo.findAll(limit, offset));
  }));

  r.post('/punishments/mute', wrap(async (req, res) => {
    const b = req.body as Record<string, unknown>;
    ok(res, await punishmentService.mute(
      Number(b['groupId']), Number(b['userId']),
      Number(b['durationSeconds'] ?? 600), String(b['reason'] ?? ''),
      Number(b['operatorId'] ?? 0)
    ));
  }));

  r.post('/punishments/kick', wrap(async (req, res) => {
    const b = req.body as Record<string, unknown>;
    ok(res, await punishmentService.kick(
      Number(b['groupId']), Number(b['userId']),
      String(b['reason'] ?? ''), Number(b['operatorId'] ?? 0)
    ));
  }));

  r.post('/punishments/:id/revoke', wrap(async (req, res) => {
    const b = req.body as Record<string, unknown>;
    await punishmentService.revoke(Number(req.params['id']), Number(b['operatorId'] ?? 0));
    ok(res);
  }));

  // ── Risk rules ──────────────────────────────────────────────────────────────
  r.get('/risk/rules', wrap((_req, res) =>
    ok(res, getDatabase().prepare('SELECT * FROM risk_rules ORDER BY created_at DESC').all())
  ));

  r.post('/risk/rules', wrap((req, res) => {
    const b = req.body as Record<string, unknown>;
    ok(res, riskService.addRule({
      name:    String(b['name']),
      type:    String(b['type']),
      pattern: String(b['pattern']),
      weight:  Number(b['weight'] ?? 1),
    }));
  }));

  r.post('/risk/rules/:id/toggle', wrap((req, res) => {
    const b = req.body as Record<string, unknown>;
    riskService.toggleRule(Number(req.params['id']), Boolean(b['enabled']));
    ok(res);
  }));

  // ── Audit logs ──────────────────────────────────────────────────────────────
  r.get('/audit', wrap((req, res) => {
    const limit  = Math.min(Number(req.query['limit']  ?? 50), 200);
    const offset = Number(req.query['offset'] ?? 0);
    ok(res, auditRepo.findAll({ limit, offset }));
  }));

  // ── Config ───────────────────────────────────────────────────────────────────
  r.get('/config', wrap((_req, res) => {
    const cfg = JSON.parse(JSON.stringify(configManager.get())) as Record<string, unknown>;
    (cfg as any).webui = { ...((cfg as any).webui ?? {}), jwtSecret: '[redacted]' };
    ok(res, cfg);
  }));

  r.post('/config', wrap((req, res) => {
    configManager.update(req.body as Parameters<typeof configManager.update>[0]);
    ok(res);
  }));

  // ── Users ───────────────────────────────────────────────────────────────────
  r.get('/users', wrap((_req, res) =>
    ok(res, userRepo.findAll().map(({ password_hash: _ph, totp_secret: _ts, ...u }) => u))
  ));

  // ── Update ───────────────────────────────────────────────────────────────────
  r.get('/update/check', wrap(async (_req, res) =>
    ok(res, { current: getCurrentVersion(), latest: await checkForUpdate() })
  ));

  r.post('/update/apply', wrap(async (req, res) => {
    await applyUpdate(req.body as Parameters<typeof applyUpdate>[0]);
    ok(res);
  }));
}
