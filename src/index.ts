/**
 * napcat-plugin-qq-guardian
 * Entry point for the NapCat plugin system.
 *
 * NapCat loads this module and calls the exported lifecycle functions.
 * plugin_init is the required entry point; all others are optional.
 *
 * Plugin lifecycle:
 *   plugin_init         → called once when plugin is first loaded
 *   plugin_enable       → called when plugin is (re-)enabled
 *   plugin_disable      → called when plugin is disabled
 *   plugin_reload       → called for hot reload (disable + enable)
 *   plugin_config_change → called when plugin config changes externally
 *   plugin_upgrade      → called after an upgrade is applied
 *   plugin_rollback     → called after a rollback
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { boot, shutdown, getState } from './core/lifecycle/index.js';
import { configManager } from './core/config/index.js';
import { getLogger } from './core/logger/index.js';
import type { NapCatPluginContext } from './types/napcat.js';

// Resolve the dist/ directory from this file's location at runtime.
// __dirname equivalent for ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Required lifecycle: plugin_init ─────────────────────────────────────────

/**
 * Called by NapCat when the plugin is first loaded.
 * @param ctx  NapCat plugin context providing bot API and data path.
 */
export async function plugin_init(ctx: NapCatPluginContext): Promise<void> {
  await boot(ctx, __dirname);
}

// ─── Optional lifecycles ──────────────────────────────────────────────────────

/**
 * Called when the plugin transitions from disabled → enabled.
 * Re-boot if we are not already running (e.g. first enable after init).
 */
export async function plugin_enable(): Promise<void> {
  if (getState() === 'running') return;
  // ctx must have been stored during plugin_init; re-use it
  const { getContext } = await import('./core/lifecycle/index.js');
  const ctx = getContext();
  if (!ctx) {
    getLogger().error('plugin_enable called but no context available – call plugin_init first');
    return;
  }
  await boot(ctx, __dirname);
}

/**
 * Called when the plugin is disabled by the user or NapCat.
 * Performs a graceful shutdown while leaving the process alive.
 */
export async function plugin_disable(): Promise<void> {
  await shutdown();
  getLogger().child({ module: 'lifecycle' }).info('Plugin disabled');
}

/**
 * Called when NapCat asks for a hot reload.
 * Equivalent to plugin_disable followed by plugin_enable.
 */
export async function plugin_reload(): Promise<void> {
  await shutdown();
  const { getContext } = await import('./core/lifecycle/index.js');
  const ctx = getContext();
  if (ctx) await boot(ctx, __dirname);
}

/**
 * Called when the plugin's external configuration changes
 * (e.g. edited via NapCat's own config panel).
 * We merge the new config over ours and emit a ConfigChanged event.
 */
export async function plugin_config_change(config: Record<string, unknown>): Promise<void> {
  if (getState() !== 'running') return;
  try {
    configManager.update(config as Parameters<typeof configManager.update>[0]);
    getLogger()
      .child({ module: 'lifecycle' })
      .info('Config updated via plugin_config_change');
  } catch (e) {
    getLogger().child({ module: 'lifecycle' }).error(e, 'Failed to apply config change');
  }
}

/**
 * Called after a plugin upgrade is installed.
 * We do a full reload so new code takes effect.
 */
export async function plugin_upgrade(): Promise<void> {
  getLogger().child({ module: 'lifecycle' }).info('Plugin upgraded — reloading');
  await plugin_reload();
}

/**
 * Called after a rollback.
 * Same treatment as upgrade: reload so old code takes effect cleanly.
 */
export async function plugin_rollback(): Promise<void> {
  getLogger().child({ module: 'lifecycle' }).info('Plugin rolled back — reloading');
  await plugin_reload();
}
