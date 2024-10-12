import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
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

export class GroupPoke extends BaseAction<Payload, any> {
    actionName = ActionName.GroupPoke;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!this.core.apis.PacketApi.PacketClient?.isConnected) {
            throw new Error('PacketClient is not init');
        }
        this.core.apis.GroupApi.sendPacketPoke(+payload.group_id, +payload.user_id);
    }
}