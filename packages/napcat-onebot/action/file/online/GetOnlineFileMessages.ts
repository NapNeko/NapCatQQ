import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ChatType } from 'napcat-core/types';

export const GetOnlineFileMessagesPayloadSchema = Type.Object({
  user_id: Type.String({ description: '用户 QQ' }),
});

export type GetOnlineFileMessagesPayload = Static<typeof GetOnlineFileMessagesPayloadSchema>;

export class GetOnlineFileMessages extends OneBotAction<GetOnlineFileMessagesPayload, any> {
  override actionName = ActionName.GetOnlineFileMessages;
  override payloadSchema = GetOnlineFileMessagesPayloadSchema;
  override returnSchema = Type.Any({ description: '在线文件消息列表' });
  override actionSummary = '获取在线文件消息';
  override actionTags = ['文件扩展'];
  override payloadExample = {
    user_id: '123456789'
  };
  override returnExample = [];

  async _handle (payload: GetOnlineFileMessagesPayload) {
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('User not found');

    // 仅私聊
    const peer = { chatType: ChatType.KCHATTYPEC2C, peerUid: uid };

    return await this.core.apis.OnlineApi.getOnlineFileMsg(peer);
  }
}
