import type { ActionMap } from 'napcat-onebot/action';
import { EventType } from 'napcat-onebot/event/OneBotEvent';
import type { PluginModule } from 'napcat-onebot/network/plugin';
import type { OB11Message, OB11PostSendMsg } from 'napcat-onebot/types/message';

let actions: ActionMap | undefined = undefined;
let startTime: number = Date.now();

/**
 * 插件初始化
 */
const plugin_init: PluginModule['plugin_init'] = async (_core, _obContext, _actions, _instance) => {
  console.log('[Plugin: builtin] NapCat 内置插件已初始化');
  actions = _actions;
};

/**
 * 消息处理
 * 当收到包含 #napcat 的消息时，回复版本信息
 */
const plugin_onmessage: PluginModule['plugin_onmessage'] = async (adapter, _core, _obCtx, event, _actions, instance) => {
  if (event.post_type !== EventType.MESSAGE || !event.raw_message.startsWith('#napcat')) {
    return;
  }

  try {
    const versionInfo = await getVersionInfo(adapter, instance.config);
    if (!versionInfo) return;

    const message = formatVersionMessage(versionInfo);
    await sendMessage(event, message, adapter, instance.config);

    console.log('[Plugin: builtin] 已回复版本信息');
  } catch (error) {
    console.error('[Plugin: builtin] 处理消息时发生错误:', error);
  }
};

/**
 * 获取版本信息（完美的类型推导，无需 as 断言）
 */
async function getVersionInfo (adapter: string, config: any) {
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
async function sendMessage (event: OB11Message, message: string, adapter: string, config: any) {
  if (!actions) return;

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
