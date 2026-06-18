/**
 * napcat-plugin-qq-guardian — NapCat plugin entry point
 *
 * Exports required by NapCat's 2026 plugin mechanism:
 *   plugin_init            (required)
 *   plugin_cleanup         (optional)
 *   plugin_onmessage       (optional)
 *   plugin_onevent         (optional)
 *   plugin_config_schema   (optional — defines settings dialog fields)
 *   plugin_get_config      (optional — returns current config values)
 *   plugin_set_config      (optional — applies saved config values)
 */

export { plugin_onmessage } from './handlers/message.js';
export { plugin_onevent }   from './handlers/event.js';

import { boot, teardown } from './core/lifecycle/index.js';
import { configManager }  from './core/config/index.js';
import type { NapCatPluginContext, PluginConfigSchema } from './types/napcat.js';

// ─── Required lifecycle ────────────────────────────────────────────────────────

export async function plugin_init(ctx: NapCatPluginContext): Promise<void> {
  await boot(ctx);
}

export async function plugin_cleanup(_ctx: NapCatPluginContext): Promise<void> {
  await teardown();
}

// ─── Config UI (fixes "此插件没有配置哦") ────────────────────────────────────

export const plugin_config_schema: PluginConfigSchema = [
  {
    key:         'selfId',
    type:        'number',
    label:       '机器人 QQ 号 / Bot QQ ID',
    description: '运行本插件的机器人 QQ 号 (Bot account QQ number)',
    default:     0,
  },
  {
    key:         'defaultApproval',
    type:        'select',
    label:       '默认入群审批方式 / Default Approval',
    description: '未单独配置的群的默认处理方式',
    options: [
      { label: '人工审核 (Manual)',         value: 'manual' },
      { label: '自动通过 (Auto-approve)',    value: 'auto_approve' },
      { label: '自动拒绝 (Auto-reject)',     value: 'auto_reject' },
      { label: '验证码 (Captcha)',           value: 'captcha' },
    ],
    default: 'manual',
  },
  {
    key:         'riskEnabled',
    type:        'boolean',
    label:       '启用风险控制 / Enable Risk Control',
    description: '自动检测并处理违规消息',
    default:     true,
  },
  {
    key:         'riskThreshold',
    type:        'number',
    label:       '风险阈值 / Risk Threshold (0-100)',
    description: '超过此分数时触发处罚动作',
    default:     70,
  },
  {
    key:         'riskAction',
    type:        'select',
    label:       '风险处理动作 / Risk Action',
    description: '触发风险时执行的操作',
    options: [
      { label: '禁言 (Mute)',          value: 'mute' },
      { label: '踢出 (Kick)',          value: 'kick' },
      { label: '通知管理员 (Notify)',  value: 'notify_admin' },
      { label: '仅记录 (Log only)',    value: 'log_only' },
    ],
    default: 'mute',
  },
  {
    key:         'autoKickBlacklisted',
    type:        'boolean',
    label:       '自动踢出黑名单用户 / Auto-kick Blacklisted',
    description: '黑名单用户入群时自动踢出',
    default:     true,
  },
];

export async function plugin_get_config(_ctx: NapCatPluginContext): Promise<Record<string, unknown>> {
  // Guard: configManager may not be initialized if called before plugin_init
  try {
    const cfg = configManager.get();
    return {
      selfId:              cfg.core?.selfId          ?? 0,
      defaultApproval:     cfg.approval?.defaultAction ?? 'manual',
      riskEnabled:         cfg.risk?.enabled          ?? true,
      riskThreshold:       cfg.risk?.threshold        ?? 70,
      riskAction:          cfg.risk?.action           ?? 'mute',
      autoKickBlacklisted: cfg.blacklist?.autoKickOnJoin ?? true,
    };
  } catch {
    return { selfId:0, defaultApproval:'manual', riskEnabled:true, riskThreshold:70, riskAction:'mute', autoKickBlacklisted:true };
  }
}

export async function plugin_set_config(_ctx: NapCatPluginContext, config: unknown): Promise<void> {
  // Guard: configManager.get() returns undefined (not a throw) if uninitialized
  if (!configManager.get()) return;
  const c = config as Record<string, unknown>;
  configManager.update({
    core:      { selfId:       c['selfId']      !== undefined ? Number(c['selfId'])           : undefined },
    approval:  { defaultAction: c['defaultApproval'] as any  ?? undefined                               },
    risk: {
      enabled:   c['riskEnabled']   !== undefined ? Boolean(c['riskEnabled'])   : undefined,
      threshold: c['riskThreshold'] !== undefined ? Number(c['riskThreshold'])  : undefined,
      action:    c['riskAction']    as any                                      ?? undefined,
    },
    blacklist: { autoKickOnJoin: c['autoKickBlacklisted'] !== undefined ? Boolean(c['autoKickBlacklisted']) : undefined },
  });
}
