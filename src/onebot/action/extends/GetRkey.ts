import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
// no_cache get时传字符串
const SchemaData = {
    type: 'object',
    properties: {
    },
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetRkey extends BaseAction<Payload, Array<any>> {
    actionName = ActionName.GetRkey;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!this.core.apis.PacketApi.packetClient?.isConnected) {
            throw new Error('PacketClient is not init');
        }
        return await this.core.apis.PacketApi.sendRkeyPacket();
    }
}
