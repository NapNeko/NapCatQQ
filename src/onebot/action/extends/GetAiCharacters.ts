import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { AIVoiceChatType } from '@/core/packet/entities/aiChat';
import { Type, Static } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    chat_type: Type.Union([Type.Union([Type.Number(), Type.String()])], { default: 1 }),
});

type Payload = Static<typeof SchemaData>;

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
