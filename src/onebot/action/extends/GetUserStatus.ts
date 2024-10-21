import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
// no_cache get时传字符串
const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: ['number', 'string'] },
    },
    required: ['user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetUserStatus extends GetPacketStatusDepends<Payload, { status: number; ext_status: number; } | undefined> {
    actionName = ActionName.GetUserStatus;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.PacketApi.sendStatusPacket(+payload.user_id);
    }
}
