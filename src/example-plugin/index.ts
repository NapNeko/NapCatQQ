import { EventType } from "@/onebot/event/OneBotEvent";
import type { PluginModule } from "@/onebot/network/plugin-manger";

const plugin_init: PluginModule["plugin_init"] = async (_core, _obContext, _actions, _instance) => {
    console.log(`[Plugin: example] 插件已初始化`);
}
const plugin_onmessage: PluginModule["plugin_onmessage"] = async (adapter, _core, _obCtx, event, actions, instance) => {
    if (event.post_type === EventType.MESSAGE && event.raw_message.includes('ping')) {
        await actions.get('send_group_msg')?.handle({ group_id: String(event.group_id), message: 'pong' }, adapter, instance.config);
    }
}
export { plugin_init, plugin_onmessage };