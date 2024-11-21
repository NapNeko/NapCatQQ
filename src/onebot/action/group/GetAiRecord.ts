import { ActionName } from '@/onebot/action/router';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
import { AIVoiceChatType } from "@/core/packet/entities/aiChat";

const SchemaData = {
    type: 'object',
    properties: {
        character: { type: ['string'] },
        group_id: { type: ['number', 'string'] },
        text: { type: 'string' },
    },
    required: ['character', 'group_id', 'text'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetAiRecord extends GetPacketStatusDepends<Payload, string> {
    actionName = ActionName.GetAiRecord;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const rawRsp = await this.core.apis.PacketApi.pkt.operation.GetAiVoice(+payload.group_id, payload.character, payload.text, AIVoiceChatType.Sound);
        return await this.core.apis.PacketApi.pkt.operation.GetGroupPttUrl(+payload.group_id, rawRsp.msgInfoBody[0].index);
    }
}
