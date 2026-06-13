import { punishmentRepo } from '../../database/repositories/punishment.js';
import { blacklistRepo } from '../../database/repositories/blacklist.js';
import { configManager } from '../../core/config/index.js';
import { callAction } from '../../core/context/index.js';
import { bus } from '../../events/index.js';
import { withLock, locks } from '../../locks/index.js';
import { statisticsRepo } from '../../database/repositories/statistics.js';
import { getLogger } from '../../core/logger/index.js';
import type { DbPunishmentRecord } from '../../database/models/index.js';

export class PunishmentService {
  init(): void { /* no-op — uses callAction() from global context */ }

  async mute(groupId: number, userId: number, durationSeconds: number, reason: string, operatorId: number): Promise<DbPunishmentRecord> {
    return withLock(locks.punishment(groupId, userId), async () => {
      const r = punishmentRepo.create({ groupId, userId, type: 'mute', durationSeconds, reason, operatorId });
      await callAction('set_group_ban', { group_id: String(groupId), user_id: String(userId), duration: durationSeconds });
      statisticsRepo.increment(groupId, 'punishments_total');
      statisticsRepo.increment(null, 'punishments_total');
      bus.emit('PunishmentCreated', { groupId, userId, type: 'mute', duration: durationSeconds, reason, operatorId, timestamp: Date.now() });
      bus.emit('UserBanned', { groupId, userId, duration: durationSeconds, reason, timestamp: Date.now() });
      bus.emit('AuditCreated', { action: 'punishment.mute', actorId: operatorId, targetType: 'user', targetId: String(userId), details: { groupId, durationSeconds, reason }, timestamp: Date.now() });
      await this._checkEscalation(groupId, userId, operatorId);
      return r;
    });
  }

  async kick(groupId: number, userId: number, reason: string, operatorId: number, rejectFuture = false): Promise<DbPunishmentRecord> {
    return withLock(locks.punishment(groupId, userId), async () => {
      const r = punishmentRepo.create({ groupId, userId, type: 'kick', durationSeconds: null, reason, operatorId });
      await callAction('set_group_kick', { group_id: String(groupId), user_id: String(userId), reject_add_request: rejectFuture });
      statisticsRepo.increment(groupId, 'punishments_total');
      statisticsRepo.increment(null, 'punishments_total');
      bus.emit('PunishmentCreated', { groupId, userId, type: 'kick', duration: null, reason, operatorId, timestamp: Date.now() });
      bus.emit('AuditCreated', { action: 'punishment.kick', actorId: operatorId, targetType: 'user', targetId: String(userId), details: { groupId, reason }, timestamp: Date.now() });
      await this._checkEscalation(groupId, userId, operatorId);
      return r;
    });
  }

  async unban(groupId: number, userId: number, operatorId: number): Promise<void> {
    await callAction('set_group_ban', { group_id: String(groupId), user_id: String(userId), duration: 0 });
    bus.emit('UserUnbanned', { groupId, userId, operatorId, timestamp: Date.now() });
    bus.emit('AuditCreated', { action: 'punishment.unban', actorId: operatorId, targetType: 'user', targetId: String(userId), details: { groupId }, timestamp: Date.now() });
  }

  async revoke(punishmentId: number, operatorId: number): Promise<void> {
    const r = punishmentRepo.findById(punishmentId);
    if (!r) throw new Error(`Punishment ${punishmentId} not found`);
    punishmentRepo.revoke(punishmentId, operatorId);
    if (r.type === 'mute') await this.unban(r.group_id, r.user_id, operatorId);
  }

  private async _checkEscalation(groupId: number, userId: number, operatorId: number): Promise<void> {
    const cfg = configManager.get().punishment;
    const count = punishmentRepo.countByUser(userId, groupId);
    const log = getLogger().child({ module: 'punishment' });
    if (count >= cfg.escalateToBlacklistAfter && !blacklistRepo.isBlacklisted(userId, groupId)) {
      blacklistRepo.add({ userId, groupId, reason: `Auto-blacklisted after ${count} punishments`, createdBy: operatorId });
      log.warn({ user_id: userId, group_id: groupId }, 'Escalated to blacklist');
      bus.emit('AuditCreated', { action: 'blacklist.auto_add', actorId: operatorId, targetType: 'user', targetId: String(userId), details: { groupId, count }, timestamp: Date.now() });
    } else if (count >= cfg.escalateToKickAfter) {
      const kicks = punishmentRepo.findByUser(userId, groupId).filter(r => r.type === 'kick');
      if (kicks.length < cfg.escalateToKickAfter) {
        log.warn({ user_id: userId, group_id: groupId }, 'Escalated to kick');
        await this.kick(groupId, userId, `Auto-kicked after ${count} punishments`, operatorId);
      }
    }
  }
}

export const punishmentService = new PunishmentService();
