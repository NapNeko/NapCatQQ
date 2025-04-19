import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { z } from 'zod';

const SchemaData = z.object({
    user_id: z.union([z.coerce.number(), z.coerce.string()])
});

type Payload = z.infer<typeof SchemaData>;

export class FriendPoke extends GetPacketStatusDepends<Payload, void> {
    override actionName = ActionName.FriendPoke;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        await this.core.apis.PacketApi.pkt.operation.FriendPoke(+payload.user_id);
    }
}
