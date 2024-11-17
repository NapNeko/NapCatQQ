import { GetPacketStatusDepends } from '../packet/GetPacketStatus';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetGroupSign extends GetPacketStatusDepends<Payload, any> {
    actionName = ActionName.SetGroupSign;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.PacketApi.pkt.operation.GroupSign(+payload.group_id);
    }
}
export class SendGroupSign extends SetGroupSign {
    actionName = ActionName.SendGroupSign;
}
