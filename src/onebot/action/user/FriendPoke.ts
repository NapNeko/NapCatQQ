import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Union([Type.Number(), Type.String()])
});

type Payload = Static<typeof SchemaData>;

export class FriendPoke extends GetPacketStatusDepends<Payload, any> {
    actionName = ActionName.FriendPoke;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        await this.core.apis.PacketApi.pkt.operation.FriendPoke(+payload.user_id);
    }
}
