import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ChatType, Peer } from 'napcat-core/types';

export const SendFlashMsgPayloadSchema = Type.Object({
  fileset_id: Type.String({ description: '文件集 ID' }),
  user_id: Type.Optional(Type.String({ description: '用户 QQ' })),
  group_id: Type.Optional(Type.String({ description: '群号' })),
});

export type SendFlashMsgPayload = Static<typeof SendFlashMsgPayloadSchema>;

export class SendFlashMsg extends OneBotAction<SendFlashMsgPayload, any> {
  override actionName = ActionName.SendFlashMsg;
  override payloadSchema = SendFlashMsgPayloadSchema;
  override returnSchema = Type.Any({ description: '发送结果' });
  override actionSummary = '发送闪照消息';
  override actionTags = ['文件扩展'];
  override payloadExample = {
    fileset_id: 'set_123',
    user_id: '123456789'
  };
  override returnExample = {
    message_id: 123456
  };

  async _handle (payload: SendFlashMsgPayload) {
    let peer: Peer;

    if (payload.group_id) {
      peer = { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id.toString() };
    } else if (payload.user_id) {
      const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
      if (!uid) throw new Error('User not found');

      // 可能需要更严格的判断
      const isBuddy = await this.core.apis.FriendApi.isBuddy(uid);
      peer = {
        chatType: isBuddy ? ChatType.KCHATTYPEC2C : ChatType.KCHATTYPETEMPC2CFROMGROUP,
        peerUid: uid,
      };
    } else {
      throw new Error('user_id or group_id is required');
    }

    return await this.core.apis.FlashApi.sendFlashMessage(payload.fileset_id, peer);
  }
}
