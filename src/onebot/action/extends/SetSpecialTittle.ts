import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
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

export class SetSpecialTittle extends GetPacketStatusDepends<Payload, any> {
    actionName = ActionName.SetSpecialTittle;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if(!uid) throw new Error('User not found');
        await this.core.apis.PacketApi.sendSetSpecialTittlePacket(payload.group_id.toString(), uid, payload.special_title);
    }
}
