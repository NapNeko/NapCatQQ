import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ChatType } from 'napcat-core/types';

export const RefuseOnlineFilePayloadSchema = Type.Object({
  user_id: Type.String({ description: '用户 QQ' }),
  msg_id: Type.String({ description: '消息 ID' }),
  element_id: Type.String({ description: '元素 ID' }),
});

export type RefuseOnlineFilePayload = Static<typeof RefuseOnlineFilePayloadSchema>;

export class RefuseOnlineFile extends OneBotAction<RefuseOnlineFilePayload, any> {
  override actionName = ActionName.RefuseOnlineFile;
  override payloadSchema = RefuseOnlineFilePayloadSchema;
  override returnSchema = Type.Any({ description: '拒绝结果' });

  async _handle (payload: RefuseOnlineFilePayload) {
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('User not found');

    const peer = { chatType: ChatType.KCHATTYPEC2C, peerUid: uid };

    return await this.core.apis.OnlineApi.refuseOnlineFileMsg(peer, payload.msg_id, payload.element_id);
  }
}
