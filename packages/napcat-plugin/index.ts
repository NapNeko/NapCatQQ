import { createActionMap } from 'napcat-onebot/action';
import { EventType } from 'napcat-onebot/event/OneBotEvent';
import type { PluginModule } from 'napcat-onebot/network/plugin';

/**
 * 导入 napcat 包时候不使用 @/napcat...，直接使用 napcat...
 * 因为 @/napcat... 会导致打包时包含整个 napcat 包，而不是只包含需要的部分
 */

// action 作为参数传递时请用这个
let actionMap: ReturnType<typeof createActionMap> | undefined = undefined;

const plugin_init: PluginModule['plugin_init'] = async (_core, _obContext, _actions, _instance) => {
  console.log('[Plugin: example] 插件已初始化');
  actionMap = _actions;
};
const plugin_onmessage: PluginModule['plugin_onmessage'] = async (adapter, _core, _obCtx, event, actions, instance) => {
  if (event.post_type === EventType.MESSAGE && event.raw_message.includes('ping')) {
    await actions.get('send_group_msg')?.handle({ group_id: String(event.group_id), message: 'pong' }, adapter, instance.config);
  }
};
export { plugin_init, plugin_onmessage, actionMap };
