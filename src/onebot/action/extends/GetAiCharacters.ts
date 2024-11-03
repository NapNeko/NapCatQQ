import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { GetPacketStatusDepends } from "@/onebot/action/packet/GetPacketStatus";
import { AIVoiceChatType } from "@/core/packet/entities/aiChat";

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        chat_type: { type: ['number', 'string'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

interface GetAiCharactersResponse {
    type: string;
    characters: {
        character_id: string;
        character_name: string;
        preview_url: string;
    }[];
}

export class GetAiCharacters extends GetPacketStatusDepends<Payload, GetAiCharactersResponse[]> {
    actionName = ActionName.GetAiCharacters;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const rawList = await this.core.apis.PacketApi.sendFetchAiVoiceListReq(+payload.group_id, +(payload.chat_type ?? 1) as AIVoiceChatType);
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
