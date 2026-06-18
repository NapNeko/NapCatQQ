import type { NapCatPluginContext } from '../../types/napcat.js';

let _ctx: NapCatPluginContext | null = null;

export function setContext(ctx: NapCatPluginContext): void { _ctx = ctx; }
export function clearContext(): void { _ctx = null; }
export function getCtx(): NapCatPluginContext {
  if (!_ctx) throw new Error('[qq-guardian] Context not initialized');
  return _ctx;
}
export function tryGetCtx(): NapCatPluginContext | null { return _ctx; }

/** Call a OneBot11 action. group_id/user_id must be strings. */
export async function callAction(action: string, params?: Record<string, unknown>): Promise<unknown> {
  const ctx = getCtx();
  return ctx.actions.call(action, params, ctx.adapterName, ctx.pluginManager.config);
}
