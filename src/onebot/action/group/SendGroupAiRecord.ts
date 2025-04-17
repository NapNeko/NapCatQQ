import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { AIVoiceChatType } from '@/core/packet/entities/aiChat';
import { z } from 'zod';
import { coerce } from '@/common/coerce';
const SchemaData = z.object({
    character: coerce.string(),
    group_id: coerce.string(),
    text: coerce.string(),
});

type Payload = z.infer<typeof SchemaData>;


export class SendGroupAiRecord extends GetPacketStatusDepends<Payload, {
    message_id: number
}> {
    override actionName = ActionName.SendGroupAiRecord;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        await this.core.apis.PacketApi.pkt.operation.GetAiVoice(+payload.group_id, payload.character, payload.text, AIVoiceChatType.Sound);
        return {
            message_id: 0  // can't get message_id from GetAiVoice
        };
    }
}
