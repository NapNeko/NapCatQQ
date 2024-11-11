import BaseAction from '../BaseAction';
import { ActionName, BaseCheckResult } from '../types';


export abstract class GetPacketStatusDepends<PT, RT> extends BaseAction<PT, RT> {
    actionName = ActionName.GetPacketStatus;

    protected async check(payload: PT): Promise<BaseCheckResult>{
        if (!this.core.apis.PacketApi.available) {
            // TODO: add error stack?
            return {
                valid: false,
                message: "packetBackend不可用，请参照文档 https://napneko.github.io/config/advanced 和启动日志检查packetBackend状态或进行配置！",
            };
        }
        return await super.check(payload);
    }
}

export class GetPacketStatus extends GetPacketStatusDepends<any, null> {
    async _handle(payload: any) {
        return null;
    }
}
