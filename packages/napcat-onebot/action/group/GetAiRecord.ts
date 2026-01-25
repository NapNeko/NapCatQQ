import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { AIVoiceChatType } from 'napcat-core/packet/entities/aiChat';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  character: Type.String({ description: '角色ID' }),
  group_id: Type.String({ description: '群号' }),
  text: Type.String({ description: '语音文本内容' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.String({ description: '语音URL' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetAiRecord extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override actionName = ActionName.GetAiRecord;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取AI语音';
  override actionDescription = '通过AI语音引擎获取指定文本的语音URL';
  override actionTags = ['群组接口'];

  async _handle (payload: PayloadType) {
    const rawRsp = await this.core.apis.PacketApi.pkt.operation.GetAiVoice(+payload.group_id, payload.character, payload.text, AIVoiceChatType.Sound);
    if (!rawRsp.msgInfoBody[0]) {
      throw new Error('No voice data');
    }
    return await this.core.apis.PacketApi.pkt.operation.GetGroupPttUrl(+payload.group_id, rawRsp.msgInfoBody[0].index);
  }
}
