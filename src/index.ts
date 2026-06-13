/**
 * napcat-plugin-qq-guardian — NapCat plugin entry point
 *
 * Exports required by NapCat's 2026 plugin mechanism:
 *   plugin_init     (required)
 *   plugin_cleanup  (optional — called on unload/hot-reload)
 *   plugin_onmessage (optional — receives all OB11 message events)
 *   plugin_onevent   (optional — receives all non-message OB11 events)
 *
 * Reference: https://napneko.github.io/develop/plugin/mechanism
 */

export { plugin_onmessage } from './handlers/message.js';
export { plugin_onevent }   from './handlers/event.js';

import { boot, teardown } from './core/lifecycle/index.js';
import type { NapCatPluginContext } from './types/napcat.js';

export async function plugin_init(ctx: NapCatPluginContext): Promise<void> {
  await boot(ctx);
}

export async function plugin_cleanup(ctx: NapCatPluginContext): Promise<void> {
  await teardown();
}
