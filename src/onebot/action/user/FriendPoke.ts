import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";

const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: ['number', 'string'] },
    },
    required: ['user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class FriendPoke extends GetPacketStatusDepends<Payload, any> {
    actionName = ActionName.FriendPoke;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        await this.core.apis.PacketApi.sendPokePacket(+payload.user_id);
    }
}
