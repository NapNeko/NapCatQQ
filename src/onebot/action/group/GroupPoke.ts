import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    user_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export class GroupPoke extends GetPacketStatusDepends<Payload, any> {
    actionName = ActionName.GroupPoke;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        await this.core.apis.PacketApi.pkt.operation.GroupPoke(+payload.user_id, +payload.group_id);
    }
}
