import { ActionName } from '../types';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";


export class GetRkey extends GetPacketStatusDepends<null, Array<any>> {
    actionName = ActionName.GetRkey;

    async _handle() {
        return await this.core.apis.PacketApi.sendRkeyPacket();
    }
}
