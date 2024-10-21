import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
// no_cache get时传字符串
const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        user_id: { type: ['number', 'string'] },
    },
    required: ['group_id', 'user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GroupPoke extends GetPacketStatusDepends<Payload, any> {
    actionName = ActionName.GroupPoke;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        await this.core.apis.PacketApi.sendPokePacket(+payload.user_id, +payload.group_id);
    }
}
