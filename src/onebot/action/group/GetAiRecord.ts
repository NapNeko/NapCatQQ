import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { AIVoiceChatType } from '@/core/packet/entities/aiChat';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    character: Type.String(),
    group_id: Type.Union([Type.Number(), Type.String()]),
    text: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class GetAiRecord extends GetPacketStatusDepends<Payload, string> {
    override actionName = ActionName.GetAiRecord;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const rawRsp = await this.core.apis.PacketApi.pkt.operation.GetAiVoice(+payload.group_id, payload.character, payload.text, AIVoiceChatType.Sound);
        if (!rawRsp.msgInfoBody[0]) {
            throw new Error('No voice data');
        }
        return await this.core.apis.PacketApi.pkt.operation.GetGroupPttUrl(+payload.group_id, rawRsp.msgInfoBody[0].index);
    }
}
