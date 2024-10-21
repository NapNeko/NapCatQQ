import BaseAction from '../BaseAction';
import { ActionName, BaseCheckResult } from '../types';


export abstract class GetPacketStatusDepends<PT, RT> extends BaseAction<PT, RT> {
    actionName = ActionName.GetPacketStatus;

    protected async check(): Promise<BaseCheckResult>{
        if (!this.core.apis.PacketApi.available) {
            return {
                valid: false,
                message: "packetServer不可用，请参照文档 https://napneko.github.io/config/advanced 检查packetServer状态或进行配置！",
            };
        }
        return {
            valid: true,
        };
    }
}

export class GetPacketStatus extends GetPacketStatusDepends<any, null> {
    async _handle(payload: any) {
        return null;
    }
}
