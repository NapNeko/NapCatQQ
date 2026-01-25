import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Type, Static } from '@sinclair/typebox';

import { ExtendsActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  chat_type: Type.Union([Type.Number(), Type.String()], { default: 1, description: '聊天类型' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(
  Type.Object({
    type: Type.String({ description: '角色类型' }),
    characters: Type.Array(
      Type.Object({
        character_id: Type.String({ description: '角色ID' }),
        character_name: Type.String({ description: '角色名称' }),
        preview_url: Type.String({ description: '预览URL' }),
      }),
      { description: '角色列表' }
    ),
  }),
  { description: 'AI角色列表' }
);

type ReturnType = Static<typeof ReturnSchema>;

export class GetAiCharacters extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override actionName = ActionName.GetAiCharacters;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取AI角色列表';
  override actionDescription = '获取群聊中的AI角色列表';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.GetAiCharacters.payload;
  override returnExample = ExtendsActionsExamples.GetAiCharacters.response;

  async _handle (payload: PayloadType) {
    const chatTypeNum = Number(payload.chat_type);
    const rawList = await this.core.apis.PacketApi.pkt.operation.FetchAiVoiceList(+payload.group_id, chatTypeNum);
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
