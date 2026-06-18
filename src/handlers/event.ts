/**
 * plugin_onevent — handles all non-message OB11 events.
 * Exported from src/index.ts as required by NapCat plugin mechanism.
 */
import type { NapCatPluginContext, OB11Event } from '../types/napcat.js';
import { approvalService } from '../modules/approval/service.js';
import { handleGroupIncrease } from '../modules/blacklist/index.js';
import { getLogger } from '../core/logger/index.js';

export async function plugin_onevent(
  _ctx: NapCatPluginContext,
  event: OB11Event
): Promise<void> {
  try {
    // Group join request → approval flow
    if (
      event.post_type === 'request' &&
      (event as any).request_type === 'group' &&
      (event as any).sub_type === 'add'
    ) {
      await approvalService.handleJoinRequest(event as any);
      return;
    }

    // Member joined → blacklist auto-kick check
    if (event.post_type === 'notice' && (event as any).notice_type === 'group_increase') {
      handleGroupIncrease(event as any);
      return;
    }
  } catch (e) {
    getLogger().child({ module: 'event' }).error(e, 'Error handling event');
  }
}
