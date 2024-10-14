import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
// no_cache get时传字符串
const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: ['number', 'string'] },
    },
    required: ['user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetUserStatus extends BaseAction<Payload, { status: number; ext_status: number; } | undefined> {
    actionName = ActionName.GetUserStatus;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!this.core.apis.PacketApi.packetClient?.available) {
            throw new Error('PacketClient is not init');
        }
        return await this.core.apis.PacketApi.sendStatusPacket(+payload.user_id);
    }
}
