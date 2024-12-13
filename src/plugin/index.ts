import { NapCatOneBot11Adapter, OB11Message } from "@/onebot";
import { NapCatCore } from "../core";
import { ActionMap } from "@/onebot/action";

export const plugin_onmessage = async (adapter: string, core: NapCatCore, obCore: NapCatOneBot11Adapter, message: OB11Message, action: ActionMap) => {
    if (message.raw_message === 'ping') {
        // TODO:
        // const a = action.get('fetch_user_profilqe_like');
        const ssa = action.get('fetch_user_profile_like');
        const ret = await action.get('send_group_msg')?.handle({ group_id: String(message.group_id), message: 'pong' }, adapter);
        console.log(ret);
    }
}
