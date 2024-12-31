import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    user_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export class SendPoke extends GetPacketStatusDepends<Payload, any> {
    actionName = ActionName.SendPoke;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (payload.group_id) {
            this.core.apis.PacketApi.pkt.operation.GroupPoke(+payload.user_id, +payload.group_id);
        } else {
            this.core.apis.PacketApi.pkt.operation.FriendPoke(+payload.user_id);
        }
    }
}