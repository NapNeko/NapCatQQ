import { bus } from '../../events/index.js';
import { blacklistRepo } from '../../database/repositories/blacklist.js';
import { configManager } from '../../core/config/index.js';
import { getLogger } from '../../core/logger/index.js';
import type { OB11NoticeEvent } from '../../types/napcat.js';
import { punishmentService } from '../punishment/service.js';

export function initBlacklistModule(): void {
  bus.on('UserJoined', async (payload) => {
    if (!configManager.get().blacklist.autoKickOnJoin) return;
    if (blacklistRepo.isBlacklisted(payload.userId, payload.groupId)) {
      getLogger().child({ module: 'blacklist' }).info(
        { user_id: payload.userId, group_id: payload.groupId }, 'Auto-kicking blacklisted user'
      );
      await punishmentService.kick(
        payload.groupId, payload.userId, 'Blacklisted user',
        configManager.get().core.selfId
      );
    }
  });
}

export function handleGroupIncrease(event: OB11NoticeEvent): void {
  bus.emit('UserJoined', {
    groupId: event.group_id!,
    userId: event.user_id!,
    subType: (event.sub_type ?? 'approve') as 'approve' | 'invite',
    timestamp: event.time * 1000,
  });
}
