import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        user_id: { type: ['number', 'string'] },
        special_title: { type: 'string' },
    },
    required: ['group_id', 'user_id', 'special_title'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetSpecialTittle extends BaseAction<Payload, any> {
    actionName = ActionName.SetSpecialTittle;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!this.core.apis.PacketApi.available) {
            throw new Error('PacketClient is not init');
        }
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if(!uid) throw new Error('User not found');
        await this.core.apis.PacketApi.sendSetSpecialTittlePacket(payload.group_id.toString(), uid, payload.special_title);
    }
}
