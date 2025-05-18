import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    user_id: Type.Union([Type.Number(), Type.String()]),
    target_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export class SendPoke extends GetPacketStatusDepends<Payload, void> {
    override actionName = ActionName.SendPoke;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (payload.group_id) {
            await this.core.apis.PacketApi.pkt.operation.GroupPoke(+payload.group_id, +payload.user_id);
        } else {
            await this.core.apis.PacketApi.pkt.operation.FriendPoke(+payload.user_id, payload.target_id ? +payload.target_id : undefined);
        }
    }
}
