import { NapCatOneBot11Adapter, OB11Message } from '@/onebot';
import { ChatType, NapCatCore } from '@/core';
import { ActionMap } from '@/onebot/action';
import { OB11PluginAdapter } from '@/onebot/network/plugin';

export const plugin_onmessage = async (adapter: string, _core: NapCatCore, _obCtx: NapCatOneBot11Adapter, message: OB11Message, action: ActionMap, instance: OB11PluginAdapter) => {
    const uid = await _core.apis.UserApi.getUidByUinV2(message.sender.user_id.toString());
    const msgs = (await _core.apis.MsgApi.queryFirstMsgBySender({
        peerUid: message.group_id ? String(message.group_id) : String(uid),
        chatType: ChatType.KCHATTYPEGROUP,
    }, [uid])).msgList;
    console.log('parse message ', message.sender.user_id, msgs.length);
    for (const msg of msgs) {
        await _obCtx.apis.MsgApi.parseMessageV2(msg)
    }
}