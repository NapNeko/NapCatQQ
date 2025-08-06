import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/onebot/action/router';


export abstract class GetPacketStatusDepends<PT, RT> extends OneBotAction<PT, RT> {
    protected override async check(payload: PT): Promise<BaseCheckResult>{
        if (!this.core.apis.PacketApi.packetStatus) {
            return {
                valid: false,
                message: 'packetBackend不可用，请参照文档 https://napneko.github.io/config/advanced 和启动日志检查packetBackend状态或进行配置！' +
                    '错误堆栈信息：' + this.core.apis.PacketApi.clientLogStack,
            };
        }
        return await super.check(payload);
    }
}

export class GetPacketStatus extends GetPacketStatusDepends<void, void> {
    override actionName = ActionName.GetPacketStatus;

    async _handle() {
        return;
    }
}
