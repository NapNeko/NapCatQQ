import { randomUUID } from 'crypto';
import { getDatabase } from '../../database/index.js';
import { approvalRepo } from '../../database/repositories/approval.js';
import { configManager } from '../../core/config/index.js';
import { callAction } from '../../core/context/index.js';
import { bus } from '../../events/index.js';
import { statisticsRepo } from '../../database/repositories/statistics.js';
import { getLogger } from '../../core/logger/index.js';
import type { OB11Message } from '../../types/napcat.js';
import type { DbCaptchaSession } from '../../database/models/index.js';
import { approvalService } from '../approval/service.js';

export class CaptchaService {
  init(): void {
    bus.on('CaptchaRequired', async (payload) => {
      await this.issueChallenge(payload.approvalId).catch(e =>
        getLogger().child({ module: 'captcha' }).error(e, 'Failed to issue challenge')
      );
    });
  }

  async issueChallenge(approvalId: number): Promise<void> {
    const rec = approvalRepo.findById(approvalId);
    if (!rec || rec.status !== 'captcha') return;
    const cfg = configManager.get().captcha;
    const type = cfg.types[Math.floor(Math.random() * cfg.types.length)] ?? 'math';
    const { challenge, answer } = this._generate(type);
    const ttlMs = cfg.ttlSeconds * 1000;
    const id = randomUUID();

    getDatabase().prepare(
      `INSERT INTO captcha_sessions (id, group_id, user_id, approval_id, type, challenge, answer, attempts, max_attempts, created_at, expires_at, solved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, rec.group_id, rec.user_id, approvalId, type, challenge, answer, 0, cfg.maxAttempts, Date.now(), Date.now() + ttlMs, 0);

    approvalRepo.updateStatus(approvalId, 'captcha', null, null, id);
    statisticsRepo.increment(rec.group_id, 'captchas_total');
    statisticsRepo.increment(null, 'captchas_total');

    await callAction('send_private_msg', {
      user_id: String(rec.user_id),
      message: this._buildMsg(challenge, cfg.ttlSeconds),
    });
    getLogger().child({ module: 'captcha' }).info({ session_id: id, user_id: rec.user_id }, 'Captcha issued');
  }

  async handlePrivateMessage(event: OB11Message): Promise<boolean> {
    if (event.message_type !== 'private') return false;
    const session = getDatabase()
      .prepare(`SELECT * FROM captcha_sessions WHERE user_id = ? AND solved = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1`)
      .get(event.user_id, Date.now()) as DbCaptchaSession | undefined;
    if (!session) return false;
    return this._processAnswer(session, event.raw_message.trim().toLowerCase());
  }

  expireAllStale(): number {
    const stale = getDatabase()
      .prepare('SELECT * FROM captcha_sessions WHERE solved = 0 AND expires_at < ?')
      .all(Date.now()) as DbCaptchaSession[];
    for (const s of stale) this._expireSession(s).catch(() => {});
    return stale.length;
  }

  private async _processAnswer(s: DbCaptchaSession, answer: string): Promise<boolean> {
    if (Date.now() > s.expires_at) { await this._expireSession(s); return true; }
    const newAttempts = s.attempts + 1;
    getDatabase().prepare('UPDATE captcha_sessions SET attempts = ? WHERE id = ?').run(newAttempts, s.id);
    if (answer === s.answer) {
      getDatabase().prepare('UPDATE captcha_sessions SET solved = ? WHERE id = ?').run(1, s.id);
      const rec = approvalRepo.findById(s.approval_id);
      if (rec) await approvalService.approveAfterCaptcha(rec);
      statisticsRepo.increment(s.group_id, 'captchas_passed');
      statisticsRepo.increment(null, 'captchas_passed');
      await callAction('send_private_msg', { user_id: String(s.user_id), message: '✅ Verification passed! Your join request has been approved.' });
      bus.emit('CaptchaSuccess', { groupId: s.group_id, userId: s.user_id, captchaId: s.id, timestamp: Date.now() });
      return true;
    }
    const remaining = s.max_attempts - newAttempts;
    if (remaining <= 0) { await this._failSession(s, 'Too many wrong attempts'); return true; }
    await callAction('send_private_msg', { user_id: String(s.user_id), message: `❌ Wrong answer. ${remaining} attempt(s) left.\n\n${s.challenge}` });
    bus.emit('CaptchaFailed', { groupId: s.group_id, userId: s.user_id, captchaId: s.id, reason: 'wrong_answer', timestamp: Date.now() });
    return true;
  }

  private async _expireSession(s: DbCaptchaSession): Promise<void> {
    getDatabase().prepare('UPDATE captcha_sessions SET solved = ? WHERE id = ?').run(1, s.id);
    const rec = approvalRepo.findById(s.approval_id);
    if (rec) await approvalService.rejectAfterCaptchaFail(rec, 'Captcha expired');
    await callAction('send_private_msg', { user_id: String(s.user_id), message: '⏰ Verification timed out. Your join request has been rejected.' });
    bus.emit('CaptchaFailed', { groupId: s.group_id, userId: s.user_id, captchaId: s.id, reason: 'expired', timestamp: Date.now() });
  }

  private async _failSession(s: DbCaptchaSession, reason: string): Promise<void> {
    getDatabase().prepare('UPDATE captcha_sessions SET solved = ? WHERE id = ?').run(1, s.id);
    const rec = approvalRepo.findById(s.approval_id);
    if (rec) await approvalService.rejectAfterCaptchaFail(rec, reason);
    await callAction('send_private_msg', { user_id: String(s.user_id), message: `❌ Verification failed: ${reason}. Your join request has been rejected.` });
    bus.emit('CaptchaFailed', { groupId: s.group_id, userId: s.user_id, captchaId: s.id, reason, timestamp: Date.now() });
  }

  private _generate(type: 'math' | 'text' | 'question'): { challenge: string; answer: string } {
    if (type === 'question') {
      const qs = configManager.get().captcha.questions;
      if (qs.length > 0) {
        const q = qs[Math.floor(Math.random() * qs.length)];
        return { challenge: q.q, answer: q.a.toLowerCase() };
      }
    }
    if (type === 'text') {
      const n = Math.floor(Math.random() * 9000) + 1000;
      return { challenge: `Please reply with the number: ${n}`, answer: String(n) };
    }
    const ops = ['+', '-', '*'] as const;
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 20) + 1, b = Math.floor(Math.random() * 10) + 1;
    const res = op === '+' ? a + b : op === '-' ? a - b : a * b;
    return { challenge: `🔢 Math verification: What is ${a} ${op} ${b}? Reply with the number only.`, answer: String(res) };
  }

  private _buildMsg(challenge: string, ttlSeconds: number): string {
    return `👋 Welcome! Please complete verification to join.\n\n${challenge}\n\n⏱ You have ${Math.round(ttlSeconds / 60)} minute(s) to answer. Reply here.`;
  }
}

export const captchaService = new CaptchaService();
