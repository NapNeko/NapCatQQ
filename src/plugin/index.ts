import { NapCatOneBot11Adapter, OB11Message } from '@/onebot';
import { NapCatCore } from '@/core';
import { ActionMap } from '@/onebot/action';
import { OB11PluginAdapter } from '@/onebot/network/plugin';

export const plugin_onmessage = async (adapter: string, _core: NapCatCore, _obCtx: NapCatOneBot11Adapter, message: OB11Message, action: ActionMap, instance: OB11PluginAdapter) => {
    if (message.raw_message === 'ping') {
        const ret = await action.get('send_group_msg')?.handle({ group_id: String(message.group_id), message: 'pong' }, adapter, instance.config);
        console.log(ret);
    }
};
