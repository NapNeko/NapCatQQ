import { getDatabase } from '../../database/index.js';
import { configManager } from '../../core/config/index.js';
import { callAction, getCtx } from '../../core/context/index.js';
import { bus } from '../../events/index.js';
import { cache } from '../../cache/index.js';
import { statisticsRepo } from '../../database/repositories/statistics.js';
import { getLogger } from '../../core/logger/index.js';
import type { OB11Message } from '../../types/napcat.js';
import type { DbRiskRule } from '../../database/models/index.js';
import { punishmentService } from '../punishment/service.js';
import { createAIProvider } from '../../providers/index.js';
import { createHash } from 'crypto';

const BUILTIN: Record<string, RegExp[]> = {
  advertising:      [/加(?:我|微信|QQ|群)[：:，, ]*[\w@]+/i, /(?:推广|代理|招商|佣金|返利)/, /(?:私信|私聊)我/],
  fraud:            [/(?:兼职|日结|月薪|年薪)\s*[\d万]+/, /(?:刷单|刷流水|点赞赚钱)/, /(?:免费领取|限时领取)/],
  grayMarket:       [/(?:发票|洗钱|代开|空壳)/, /(?:非法|违禁品|走私)/],
  pornography:      [/(?:约炮|约P|开房|一夜情)/i, /(?:裸聊|色情|黄片)/i],
  political:        [/(?:推翻|颠覆|政权|敏感政治)/],
  gambling:         [/(?:赌博|博彩|百家乐|老虎机|彩票代购)/, /(?:下注|押注|赌场)/],
  shortLinks:       [/(?:t\.cn|suo\.im|dwz\.cn|bit\.ly|tinyurl)\//],
  spam:             [/(.{5,})\1{3,}/],
};

export class RiskService {
  private recentMsgs = new Map<string, number[]>();

  init(): void { /* uses callAction() from global context */ }

  async handleGroupMessage(event: OB11Message): Promise<void> {
    const cfg = configManager.get().risk;
    if (!cfg.enabled) return;
    const score = await this._score(event.raw_message, event.group_id!, event.user_id);
    if (score < cfg.threshold) return;

    const log = getLogger().child({ module: 'risk' });
    log.warn({ group_id: event.group_id, user_id: event.user_id, score }, 'Risk detected');
    statisticsRepo.increment(event.group_id!, 'risk_detections');
    statisticsRepo.increment(null, 'risk_detections');
    bus.emit('RiskDetected', { groupId: event.group_id!, userId: event.user_id, messageId: event.message_id, riskType: 'risk', score, timestamp: Date.now() });

    const selfId = configManager.get().core.selfId;
    switch (cfg.action) {
      case 'mute':   await punishmentService.mute(event.group_id!, event.user_id, cfg.muteDurationSeconds, `Risk score ${score}`, selfId); break;
      case 'kick':   await punishmentService.kick(event.group_id!, event.user_id, `Risk score ${score}`, selfId); break;
      case 'notify_admin':
        for (const id of configManager.get().core.superAdmins) {
          await callAction('send_private_msg', { user_id: String(id), message: `⚠️ Risk in group ${event.group_id!}: user ${event.user_id}, score ${score}\n${event.raw_message.slice(0, 100)}` }).catch(() => {});
        }
        break;
    }
  }

  reloadRules(): void {
    const rules = getDatabase().prepare('SELECT * FROM risk_rules WHERE enabled = 1').all() as DbRiskRule[];
    cache.permissions.set('risk_rules', rules);
  }

  addRule(data: { name: string; type: string; pattern: string; weight: number }): DbRiskRule {
    const now = Date.now();
    const r = getDatabase().prepare(`INSERT INTO risk_rules (name, type, pattern, weight, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)`).run(data.name, data.type, data.pattern, data.weight, now, now);
    this.reloadRules();
    return getDatabase().prepare('SELECT * FROM risk_rules WHERE id = ?').get(r.lastInsertRowid as number) as DbRiskRule;
  }

  toggleRule(id: number, enabled: boolean): void {
    getDatabase().prepare('UPDATE risk_rules SET enabled = ?, updated_at = ? WHERE id = ?').run(enabled ? 1 : 0, Date.now(), id);
    this.reloadRules();
  }

  private async _score(text: string, groupId: number, userId: number): Promise<number> {
    const cfg = configManager.get().risk;
    let score = 0;

    for (const [name, patterns] of Object.entries(BUILTIN)) {
      if (!cfg.detectors[name as keyof typeof cfg.detectors]) continue;
      const w = cfg.weights[name] ?? 1;
      for (const re of patterns) { if (re.test(text)) { score += 30 * w; break; } }
    }

    if (cfg.detectors.duplicateMessages) {
      const key = `${userId}:${groupId}`;
      const now = Date.now();
      const ts = (this.recentMsgs.get(key) ?? []).filter(t => now - t < 10_000);
      ts.push(now); this.recentMsgs.set(key, ts);
      if (ts.length >= 5) score += 40;
    }

    const rules = cache.permissions.get<DbRiskRule[]>('risk_rules') ?? [];
    for (const rule of rules) {
      try { if (new RegExp(rule.pattern).test(text)) score += 30 * rule.weight; } catch { /**/ }
    }

    if (cfg.detectors.aiViolation && score < cfg.threshold) {
      const hash = createHash('md5').update(text).digest('hex');
      const cached = cache.aiRisk.get<{ score: number }>(hash);
      if (cached) { score += cached.score * 0.5; }
      else {
        const r = await createAIProvider().analyzeRisk(text);
        if (r.ok && r.data) { cache.aiRisk.set(hash, r.data); score += r.data.score * 0.5; }
      }
    }

    return Math.min(100, Math.round(score));
  }
}

export const riskService = new RiskService();
