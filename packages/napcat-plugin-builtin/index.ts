import type { ActionMap } from 'napcat-types/napcat-onebot/action/index';
import { EventType } from 'napcat-types/napcat-onebot/event/index';
import type { PluginModule } from 'napcat-types/napcat-onebot/network/plugin-manger';
import type { OB11Message, OB11PostSendMsg } from 'napcat-types/napcat-onebot/types/index';

import fs from 'fs';
import path from 'path';
import type { PluginConfigSchema } from 'napcat-types/napcat-onebot/network/plugin-manger';
let startTime: number = Date.now();

interface BuiltinPluginConfig {
  prefix: string;
  enableReply: boolean;
  description: string;
  theme?: string;
  features?: string[];
  [key: string]: unknown;
}

let currentConfig: BuiltinPluginConfig = {
  prefix: '#napcat',
  enableReply: true,
  description: '这是一个内置插件的配置示例'
};


export let plugin_config_ui: PluginConfigSchema = [];

/**
 * 插件初始化
 */
const plugin_init: PluginModule['plugin_init'] = async (ctx) => {
  console.log('[Plugin: builtin] NapCat 内置插件已初始化');
  plugin_config_ui = ctx.NapCatConfig.combine(
    ctx.NapCatConfig.html('<div style="padding: 10px; background: rgba(0,0,0,0.05); border-radius: 8px;"><h3>👋 Welcome to NapCat Builtin Plugin</h3><p>This is a demonstration of the plugin configuration interface.</p></div>'),
    ctx.NapCatConfig.text('prefix', 'Command Prefix', '#napcat', 'The prefix to trigger the version info command'),
    ctx.NapCatConfig.boolean('enableReply', 'Enable Reply', true, 'Switch to enable or disable the reply functionality'),
    ctx.NapCatConfig.select('theme', 'Theme Selection', [
      { label: 'Light Mode', value: 'light' },
      { label: 'Dark Mode', value: 'dark' },
      { label: 'Auto', value: 'auto' }
    ], 'light', 'Select a theme for the response (Demo purpose only)'),
    ctx.NapCatConfig.multiSelect('features', 'Enabled Features', [
      { label: 'Version Info', value: 'version' },
      { label: 'Status Report', value: 'status' },
      { label: 'Debug Log', value: 'debug' }
    ], ['version'], 'Select features to enable'),
    ctx.NapCatConfig.text('description', 'Description', '这是一个内置插件的配置示例', 'A multi-line text area for notes')
  );

  // Try to load config
  try {
    // Use ctx.configPath
    if (fs.existsSync(ctx.configPath)) {
      const savedConfig = JSON.parse(fs.readFileSync(ctx.configPath, 'utf-8'));
      Object.assign(currentConfig, savedConfig);
    }
  } catch (e) {
    console.warn('[Plugin: builtin] Failed to load config', e);
  }

};

export const plugin_get_config = async () => {
  return currentConfig;
};

export const plugin_set_config = async (ctx: any, config: BuiltinPluginConfig) => {
  currentConfig = config;
  if (ctx && ctx.configPath) {
    try {
      const configPath = ctx.configPath;
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Plugin: builtin] Failed to save config', e);
      throw e;
    }
  }
};

/**
 * 消息处理
 * 当收到包含 #napcat 的消息时，回复版本信息
 */
const plugin_onmessage: PluginModule['plugin_onmessage'] = async (_ctx, event) => {
  // Use config logic
  const prefix = currentConfig.prefix || '#napcat';
  if (currentConfig.enableReply === false) {
    return;
  }

  if (event.post_type !== EventType.MESSAGE || !event.raw_message.startsWith(prefix)) {
    return;
  }

  try {
    const versionInfo = await getVersionInfo(_ctx.actions, _ctx.adapterName, {});
    if (!versionInfo) return;

    const message = formatVersionMessage(versionInfo);
    await sendMessage(_ctx.actions, event, message, _ctx.adapterName, {});

    console.log('[Plugin: builtin] 已回复版本信息');
  } catch (error) {
    console.error('[Plugin: builtin] 处理消息时发生错误:', error);
  }
};

/**
 * 获取版本信息（完美的类型推导，无需 as 断言）
 */
async function getVersionInfo (actions: ActionMap, adapter: string, config: any) {
  if (!actions) return null;

  try {
    const data = await actions.call('get_version_info', void 0, adapter, config);
    return {
      appName: data.app_name,
      appVersion: data.app_version,
      protocolVersion: data.protocol_version,
    };
  } catch (error) {
    console.error('[Plugin: builtin] 获取版本信息失败:', error);
    return null;
  }
}

/**
 * 格式化运行时间
 */
function formatUptime (ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟 ${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
}

/**
 * 格式化版本信息消息
 */
function formatVersionMessage (info: { appName: string; appVersion: string; protocolVersion: string; }) {
  const uptime = Date.now() - startTime;
  return `NapCat 信息\n版本: ${info.appVersion}\n平台: ${process.platform}${process.arch === 'x64' ? ' (64-bit)' : ''}\n运行时间: ${formatUptime(uptime)}`;
}

/**
 * 发送消息（完美的类型推导）
 */
async function sendMessage (actions: ActionMap, event: OB11Message, message: string, adapter: string, config: any) {
  const params: OB11PostSendMsg = {
    message,
    message_type: event.message_type,
    ...(event.message_type === 'group' && event.group_id ? { group_id: String(event.group_id) } : {}),
    ...(event.message_type === 'private' && event.user_id ? { user_id: String(event.user_id) } : {}),
  };

  try {
    await actions.call('send_msg', params, adapter, config);
  } catch (error) {
    console.error('[Plugin: builtin] 发送消息失败:', error);
  }
}

export { plugin_init, plugin_onmessage };
