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

const ReturnSchema = Type.Object({
  message_id: Type.Number({ description: '消息ID' }),
}, { description: '发送结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SendGroupAiRecord extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override actionName = ActionName.SendGroupAiRecord;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '发送群AI语音';
  override actionDescription = '在群聊中发送由AI引擎生成的语音';
  override actionTags = ['群组接口'];

  async _handle (payload: PayloadType) {
    await this.core.apis.PacketApi.pkt.operation.GetAiVoice(+payload.group_id, payload.character, payload.text, AIVoiceChatType.Sound);
    return {
      message_id: 0,  // can't get message_id from GetAiVoice
    };
  }
}
