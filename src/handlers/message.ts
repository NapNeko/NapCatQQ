/**
 * plugin_onmessage — handles all OB11 message events.
 * Exported from src/index.ts as required by NapCat plugin mechanism.
 */
import type { NapCatPluginContext, OB11Message } from '../types/napcat.js';
import { captchaService } from '../modules/captcha/service.js';
import { riskService } from '../modules/risk/service.js';
import { getLogger } from '../core/logger/index.js';

export async function plugin_onmessage(
  _ctx: NapCatPluginContext,
  event: OB11Message
): Promise<void> {
  try {
    if (event.message_type === 'private') {
      await captchaService.handlePrivateMessage(event);
      return;
    }
    if (event.message_type === 'group') {
      await riskService.handleGroupMessage(event);
      return;
    }
  } catch (e) {
    getLogger().child({ module: 'message' }).error(e, 'Error handling message');
  }
}
