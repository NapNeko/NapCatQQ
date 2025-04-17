import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { z } from 'zod';
import { actionType } from '../type';
const SchemaData = z.object({
    group_id: actionType.string(),
    user_id: actionType.string(),
});

type Payload = z.infer<typeof SchemaData>;

export class GroupPoke extends GetPacketStatusDepends<Payload, void> {
    override actionName = ActionName.GroupPoke;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        await this.core.apis.PacketApi.pkt.operation.GroupPoke(+payload.group_id, +payload.user_id);
    }
}
