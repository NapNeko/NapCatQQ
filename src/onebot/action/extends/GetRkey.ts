import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';

export class GetRkey extends GetPacketStatusDepends<void, Array<any>> {
    actionName = ActionName.GetRkey;

    async _handle() {
        return await this.core.apis.PacketApi.pkt.operation.FetchRkey();
    }
}
