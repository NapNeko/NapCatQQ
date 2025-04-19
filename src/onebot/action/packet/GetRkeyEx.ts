import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';

export class GetRkeyEx extends GetPacketStatusDepends<void, unknown> {
    override actionName = ActionName.GetRkeyEx;

    async _handle() {
        let rkeys = await this.core.apis.PacketApi.pkt.operation.FetchRkey();
        return rkeys.map(rkey => {
            return {
                type: rkey.type === 10 ? "private" : "group",
                rkey: rkey.rkey,
                created_at: rkey.time,
                ttl: rkey.ttl,
            };
        });
    }
}