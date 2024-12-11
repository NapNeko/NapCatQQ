import { NapCatOneBot11Adapter, OB11Message } from "@/onebot";
import SendGroupMsg from "@/onebot/action/group/SendGroupMsg";
import { NapCatCore } from "..";

export const plugin_onmessage = async (adapter: string, core: NapCatCore, obCore: NapCatOneBot11Adapter, message: OB11Message) => {
    if (message.raw_message === 'ping') {
        const ret = await new SendGroupMsg(obCore, core).handle({ group_id: String(message.group_id), message: 'pong' }, adapter);
        console.log(ret);
    }
}