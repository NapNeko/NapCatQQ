import type { ActionMap } from 'napcat-types/napcat-onebot/action/index';
import { EventType } from 'napcat-types/napcat-onebot/event/index';
import type { PluginModule, PluginLogger, PluginConfigSchema, PluginConfigUIController } from 'napcat-types/napcat-onebot/network/plugin-manger';
import type { OB11Message, OB11PostSendMsg } from 'napcat-types/napcat-onebot/types/index';
import fs from 'fs';
import path from 'path';
import { NetworkAdapterConfig } from 'napcat-types/napcat-onebot/config/config';


let startTime: number = Date.now();
let logger: PluginLogger | null = null;

interface BuiltinPluginConfig {
  prefix: string;
  enableReply: boolean;
  description: string;
  theme?: string;
  features?: string[];
  apiUrl?: string;
  apiEndpoints?: string[];
  [key: string]: unknown;
}

let currentConfig: BuiltinPluginConfig = {
  prefix: '#napcat',
  enableReply: true,
  description: '这是一个内置插件的配置示例'
};


export let plugin_config_ui: PluginConfigSchema = [];

const plugin_init: PluginModule['plugin_init'] = async (ctx) => {
  logger = ctx.logger;
  logger.info('NapCat 内置插件已初始化');
  plugin_config_ui = ctx.NapCatConfig.combine(
    ctx.NapCatConfig.html('<div style="padding: 10px; background: rgba(0,0,0,0.05); border-radius: 8px;"><h3>👋 Welcome to NapCat Builtin Plugin</h3><p>This is a demonstration of the plugin configuration interface with reactive fields.</p></div>'),
    ctx.NapCatConfig.text('prefix', 'Command Prefix', '#napcat', 'The prefix to trigger the version info command'),
    ctx.NapCatConfig.boolean('enableReply', 'Enable Reply', true, 'Switch to enable or disable the reply functionality'),
    // 代表监听 apiUrl 字段的变化
    { ...ctx.NapCatConfig.text('apiUrl', 'API URL', '', 'Enter an API URL to load available endpoints'), reactive: true },
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
    logger?.warn('Failed to load config', e);
  }

};

export const plugin_get_config: PluginModule['plugin_get_config'] = async () => {
  return currentConfig;
};

export const plugin_set_config: PluginModule['plugin_set_config'] = async (ctx, config: BuiltinPluginConfig) => {
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
      logger?.error('Failed to save config', e);
      throw e;
    }
  }
};

/**
 * 响应式配置控制器 - 当插件配置界面打开时调用
 * 用于初始化动态 UI 控制
 */
export const plugin_config_controller: PluginModule['plugin_config_controller'] = async (_ctx, ui, initialConfig) => {
  logger?.info('配置控制器已初始化', initialConfig);

  // 如果初始配置中有 apiUrl，立即加载端点
  if (initialConfig['apiUrl']) {
    await loadEndpointsForUrl(ui, initialConfig['apiUrl'] as string);
  }

  // 返回清理函数
  return () => {
    logger?.info('配置控制器已清理');
  };
};

/**
 * 响应式字段变化处理 - 当标记为 reactive 的字段值变化时调用
 */
export const plugin_on_config_change: PluginModule['plugin_on_config_change'] = async (_ctx, ui, key, value, _currentConfig: Partial<BuiltinPluginConfig>) => {
  logger?.info(`配置字段变化: ${key} = ${value}`);

  if (key === 'apiUrl') {
    await loadEndpointsForUrl(ui, value as string);
  }
};

/**
 * 根据 API URL 动态加载端点列表
 */
async function loadEndpointsForUrl (ui: PluginConfigUIController, apiUrl: string) {
  if (!apiUrl) {
    // URL 为空时，移除端点选择字段
    ui.removeField('apiEndpoints');
    return;
  }

  // 模拟从 API 获取端点列表（实际使用时可以 fetch 真实 API）
  const mockEndpoints = [
    { label: `${apiUrl}/users`, value: '/users' },
    { label: `${apiUrl}/posts`, value: '/posts' },
    { label: `${apiUrl}/comments`, value: '/comments' },
    { label: `${apiUrl}/albums`, value: '/albums' },
  ];

  // 动态添加或更新端点选择字段
  const currentSchema = ui.getCurrentConfig();
  if ('apiEndpoints' in currentSchema) {
    // 更新现有字段的选项
    ui.updateField('apiEndpoints', {
      options: mockEndpoints,
      description: `从 ${apiUrl} 加载的端点`
    });
  } else {
    // 添加新字段
    ui.addField({
      key: 'apiEndpoints',
      type: 'multi-select',
      label: 'API Endpoints',
      description: `从 ${apiUrl} 加载的端点`,
      options: mockEndpoints,
      default: []
    }, 'apiUrl');
  }
}

const plugin_onmessage: PluginModule['plugin_onmessage'] = async (_ctx, event) => {
  if (currentConfig.enableReply === false) {
    return;
  }
  const prefix = currentConfig.prefix || '#napcat';
  if (event.post_type !== EventType.MESSAGE || !event.raw_message.startsWith(prefix)) {
    return;
  }

  try {
    const versionInfo = await getVersionInfo(_ctx.actions, _ctx.adapterName, _ctx.pluginManager.config);
    if (!versionInfo) return;

    const message = formatVersionMessage(versionInfo);
    await sendMessage(_ctx.actions, event, message, _ctx.adapterName, _ctx.pluginManager.config);

    logger?.info('已回复版本信息');
  } catch (error) {
    logger?.error('处理消息时发生错误:', error);
  }
};

async function getVersionInfo (actions: ActionMap, adapter: string, config: NetworkAdapterConfig) {
  if (!actions) return null;

  try {
    const data = await actions.call('get_version_info', void 0, adapter, config);
    return {
      appName: data.app_name,
      appVersion: data.app_version,
      protocolVersion: data.protocol_version,
    };
  } catch (error) {
    logger?.error('获取版本信息失败:', error);
    return null;
  }
}

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

function formatVersionMessage (info: { appName: string; appVersion: string; protocolVersion: string; }) {
  const uptime = Date.now() - startTime;
  return `NapCat 信息\n版本: ${info.appVersion}\n平台: ${process.platform}${process.arch === 'x64' ? ' (64-bit)' : ''}\n运行时间: ${formatUptime(uptime)}`;
}

async function sendMessage (actions: ActionMap, event: OB11Message, message: string, adapter: string, config: NetworkAdapterConfig) {
  const params: OB11PostSendMsg = {
    message,
    message_type: event.message_type,
    ...(event.message_type === 'group' && event.group_id ? { group_id: String(event.group_id) } : {}),
    ...(event.message_type === 'private' && event.user_id ? { user_id: String(event.user_id) } : {}),
  };

  try {
    await actions.call('send_msg', params, adapter, config);
  } catch (error) {
    logger?.error('发送消息失败:', error);
  }
}

export { plugin_init, plugin_onmessage };
