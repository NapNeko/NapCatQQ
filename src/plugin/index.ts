import { NapCatOneBot11Adapter, OB11Message } from "@/onebot";
import { NapCatCore } from "../core";
import { SetSpecialTittle } from "@/onebot/action/extends/SetSpecialTittle";

export const plugin_onmessage = async (adapter: string, core: NapCatCore, obCore: NapCatOneBot11Adapter, message: OB11Message) => {
    if (message.raw_message.startsWith('设置头衔') && message.group_id) {
        const ret = await new SetSpecialTittle(obCore, core)
            .handle({ group_id: message.group_id, user_id: message.user_id, special_title: message.raw_message.replace('设置头衔', '') }, adapter);
    }
}