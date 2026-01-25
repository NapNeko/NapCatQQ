import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ChatType } from 'napcat-core/types';

export const CancelOnlineFilePayloadSchema = Type.Object({
  user_id: Type.String({ description: '用户 QQ' }),
  msg_id: Type.String({ description: '消息 ID' }),
});

export type CancelOnlineFilePayload = Static<typeof CancelOnlineFilePayloadSchema>;

export class CancelOnlineFile extends OneBotAction<CancelOnlineFilePayload, any> {
  override actionName = ActionName.CancelOnlineFile;
  override payloadSchema = CancelOnlineFilePayloadSchema;
  override returnSchema = Type.Any({ description: '取消结果' });

  async _handle (payload: CancelOnlineFilePayload) {
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('User not found');

    // 仅私聊
    const peer = { chatType: ChatType.KCHATTYPEC2C, peerUid: uid };

    return await this.core.apis.OnlineApi.cancelMyOnlineFileMsg(peer, payload.msg_id);
  }
}
