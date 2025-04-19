import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { AIVoiceChatType } from '@/core/packet/entities/aiChat';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.string(),
    chat_type: z.number().default(1),
});

type Payload = z.infer<typeof SchemaData>;

interface GetAiCharactersResponse {
    type: string;
    characters: {
        character_id: string;
        character_name: string;
        preview_url: string;
    }[];
}

export class GetAiCharacters extends GetPacketStatusDepends<Payload, GetAiCharactersResponse[]> {
    override actionName = ActionName.GetAiCharacters;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const rawList = await this.core.apis.PacketApi.pkt.operation.FetchAiVoiceList(+payload.group_id, +payload.chat_type as AIVoiceChatType);
        return rawList?.map((item) => ({
            type: item.category,
            characters: item.voices.map((voice) => ({
                character_id: voice.voiceId,
                character_name: voice.voiceDisplayName,
                preview_url: voice.voiceExampleUrl,
            })),
        })) ?? [];
    }
}
