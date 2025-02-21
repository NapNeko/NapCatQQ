import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export class GetUserStatus extends GetPacketStatusDepends<Payload, { status: number; ext_status: number; } | undefined> {
    override actionName = ActionName.GetUserStatus;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.PacketApi.pkt.operation.GetStrangerStatus(+payload.user_id);
    }
}
