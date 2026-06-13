import { approvalRepo } from '../../database/repositories/approval.js';
import { blacklistRepo } from '../../database/repositories/blacklist.js';
import { configManager } from '../../core/config/index.js';
import { callAction } from '../../core/context/index.js';
import { bus } from '../../events/index.js';
import { withLock, locks } from '../../locks/index.js';
import { statisticsRepo } from '../../database/repositories/statistics.js';
import { getLogger } from '../../core/logger/index.js';
import type { OB11RequestEvent, OB11NoticeEvent } from '../../types/napcat.js';
import type { DbApprovalRecord } from '../../database/models/index.js';

export class ApprovalService {
  init(): void { /* services now use callAction() from global context */ }

  async handleJoinRequest(event: OB11RequestEvent): Promise<void> {
    if (event.request_type !== 'group' || event.sub_type !== 'add') return;
    const { group_id, user_id, flag, comment } = event as Required<OB11RequestEvent>;
    const cfg = configManager.get();
    const groupCfg = cfg.approval.groups[String(group_id)] ?? {
      action: cfg.approval.defaultAction,
      approveKeywords: [], rejectKeywords: [],
      approvePatterns: [], rejectPatterns: [],
      rejectReason: 'Does not meet entry requirements',
    };

    if (blacklistRepo.isBlacklisted(user_id, group_id)) {
      await this._reject(flag, 'You are on the group blacklist.', null);
      statisticsRepo.increment(group_id, 'approvals_rejected');
      return;
    }

    statisticsRepo.increment(group_id, 'approvals_total');
    statisticsRepo.increment(null, 'approvals_total');

    const rejectReason = this._matchReject(comment ?? '', groupCfg);
    if (rejectReason) {
      const r = approvalRepo.create({ groupId: group_id, userId: user_id, flag, comment: comment ?? '', status: 'rejected', ttlSeconds: cfg.approval.pendingTtlSeconds });
      approvalRepo.updateStatus(r.id, 'rejected', null, rejectReason);
      await this._reject(flag, rejectReason, null);
      statisticsRepo.increment(group_id, 'approvals_rejected');
      bus.emit('ApprovalRejected', { groupId: group_id, userId: user_id, flag, reason: rejectReason, operatorId: null, timestamp: Date.now() });
      return;
    }

    if (this._matchApprove(comment ?? '', groupCfg)) {
      const r = approvalRepo.create({ groupId: group_id, userId: user_id, flag, comment: comment ?? '', status: 'approved', ttlSeconds: cfg.approval.pendingTtlSeconds });
      approvalRepo.updateStatus(r.id, 'approved', null, null);
      await this._approve(flag, null);
      statisticsRepo.increment(group_id, 'approvals_passed');
      bus.emit('ApprovalPassed', { groupId: group_id, userId: user_id, flag, operatorId: null, timestamp: Date.now() });
      return;
    }

    switch (groupCfg.action) {
      case 'auto_approve':
        await this._autoApprove(group_id, user_id, flag, comment ?? '', cfg.approval.pendingTtlSeconds); break;
      case 'auto_reject':
        await this._autoReject(group_id, user_id, flag, comment ?? '', groupCfg.rejectReason, cfg.approval.pendingTtlSeconds); break;
      case 'captcha':
        await this._routeToCaptcha(group_id, user_id, flag, comment ?? '', cfg.approval.pendingTtlSeconds); break;
      default:
        approvalRepo.create({ groupId: group_id, userId: user_id, flag, comment: comment ?? '', status: 'pending', ttlSeconds: cfg.approval.pendingTtlSeconds });
        getLogger().child({ module: 'approval' }).info({ group_id, user_id }, 'Queued for manual review');
    }
  }

  async approveManually(id: number, operatorId: number): Promise<void> {
    const rec = approvalRepo.findById(id);
    if (!rec || rec.status !== 'pending') throw new Error('Invalid approval record');
    await withLock(locks.approval(rec.flag), async () => {
      await this._approve(rec.flag, operatorId);
      approvalRepo.updateStatus(id, 'approved', operatorId, null);
      statisticsRepo.increment(rec.group_id, 'approvals_passed');
      statisticsRepo.increment(null, 'approvals_passed');
      bus.emit('ApprovalPassed', { groupId: rec.group_id, userId: rec.user_id, flag: rec.flag, operatorId, timestamp: Date.now() });
    });
  }

  async rejectManually(id: number, operatorId: number, reason: string): Promise<void> {
    const rec = approvalRepo.findById(id);
    if (!rec || rec.status !== 'pending') throw new Error('Invalid approval record');
    await withLock(locks.approval(rec.flag), async () => {
      await this._reject(rec.flag, reason, operatorId);
      approvalRepo.updateStatus(id, 'rejected', operatorId, reason);
      statisticsRepo.increment(rec.group_id, 'approvals_rejected');
      statisticsRepo.increment(null, 'approvals_rejected');
      bus.emit('ApprovalRejected', { groupId: rec.group_id, userId: rec.user_id, flag: rec.flag, reason, operatorId, timestamp: Date.now() });
    });
  }

  async approveAfterCaptcha(rec: DbApprovalRecord): Promise<void> {
    await withLock(locks.approval(rec.flag), async () => {
      await this._approve(rec.flag, null);
      approvalRepo.updateStatus(rec.id, 'approved', null, 'captcha_passed');
      statisticsRepo.increment(rec.group_id, 'approvals_passed');
      statisticsRepo.increment(null, 'approvals_passed');
      bus.emit('ApprovalPassed', { groupId: rec.group_id, userId: rec.user_id, flag: rec.flag, operatorId: null, timestamp: Date.now() });
    });
  }

  async rejectAfterCaptchaFail(rec: DbApprovalRecord, reason: string): Promise<void> {
    await withLock(locks.approval(rec.flag), async () => {
      await this._reject(rec.flag, reason, null);
      approvalRepo.updateStatus(rec.id, 'rejected', null, reason);
      statisticsRepo.increment(rec.group_id, 'approvals_rejected');
      statisticsRepo.increment(null, 'approvals_rejected');
      bus.emit('ApprovalRejected', { groupId: rec.group_id, userId: rec.user_id, flag: rec.flag, reason, operatorId: null, timestamp: Date.now() });
    });
  }

  expirePendingRequests(): number { return approvalRepo.expireOldPending(); }

  private async _approve(flag: string, operatorId: number | null): Promise<void> {
    await callAction('set_group_add_request', { flag, sub_type: 'add', approve: true });
    bus.emit('AuditCreated', { action: 'approval.approve', actorId: operatorId, targetType: 'approval', targetId: flag, details: { operatorId }, timestamp: Date.now() });
  }

  private async _reject(flag: string, reason: string, operatorId: number | null): Promise<void> {
    await callAction('set_group_add_request', { flag, sub_type: 'add', approve: false, reason });
    bus.emit('AuditCreated', { action: 'approval.reject', actorId: operatorId, targetType: 'approval', targetId: flag, details: { reason }, timestamp: Date.now() });
  }

  private async _autoApprove(groupId: number, userId: number, flag: string, comment: string, ttl: number): Promise<void> {
    const r = approvalRepo.create({ groupId, userId, flag, comment, status: 'approved', ttlSeconds: ttl });
    approvalRepo.updateStatus(r.id, 'approved', null, 'auto_approved');
    await this._approve(flag, null);
    statisticsRepo.increment(groupId, 'approvals_passed');
    bus.emit('ApprovalPassed', { groupId, userId, flag, operatorId: null, timestamp: Date.now() });
  }

  private async _autoReject(groupId: number, userId: number, flag: string, comment: string, reason: string, ttl: number): Promise<void> {
    const r = approvalRepo.create({ groupId, userId, flag, comment, status: 'rejected', ttlSeconds: ttl });
    approvalRepo.updateStatus(r.id, 'rejected', null, reason);
    await this._reject(flag, reason, null);
    statisticsRepo.increment(groupId, 'approvals_rejected');
    bus.emit('ApprovalRejected', { groupId, userId, flag, reason, operatorId: null, timestamp: Date.now() });
  }

  private async _routeToCaptcha(groupId: number, userId: number, flag: string, comment: string, ttl: number): Promise<void> {
    const r = approvalRepo.create({ groupId, userId, flag, comment, status: 'captcha', ttlSeconds: ttl });
    bus.emit('CaptchaRequired', { approvalId: r.id, groupId, userId, timestamp: Date.now() });
    getLogger().child({ module: 'approval' }).info({ group_id: groupId, user_id: userId, approval_id: r.id }, 'Routed to captcha');
  }

  private _matchApprove(comment: string, cfg: { approveKeywords: string[]; approvePatterns: string[] }): boolean {
    for (const kw of cfg.approveKeywords) if (comment.includes(kw)) return true;
    for (const p of cfg.approvePatterns) { try { if (new RegExp(p).test(comment)) return true; } catch { /**/ } }
    return false;
  }

  private _matchReject(comment: string, cfg: { rejectKeywords: string[]; rejectPatterns: string[]; rejectReason: string }): string | null {
    for (const kw of cfg.rejectKeywords) if (comment.includes(kw)) return cfg.rejectReason;
    for (const p of cfg.rejectPatterns) { try { if (new RegExp(p).test(comment)) return cfg.rejectReason; } catch { /**/ } }
    return null;
  }
}

export const approvalService = new ApprovalService();
