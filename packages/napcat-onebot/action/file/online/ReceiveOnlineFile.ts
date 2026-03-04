import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ChatType } from 'napcat-core/types';

export const ReceiveOnlineFilePayloadSchema = Type.Object({
  user_id: Type.String({ description: '用户 QQ' }),
  msg_id: Type.String({ description: '消息 ID' }),
  element_id: Type.String({ description: '元素 ID' }),
});

export type ReceiveOnlineFilePayload = Static<typeof ReceiveOnlineFilePayloadSchema>;

export class ReceiveOnlineFile extends OneBotAction<ReceiveOnlineFilePayload, any> {
  override actionName = ActionName.ReceiveOnlineFile;
  override payloadSchema = ReceiveOnlineFilePayloadSchema;
  override returnSchema = Type.Any({ description: '接收结果' });
  override actionSummary = '接收在线文件';
  override actionTags = ['文件扩展'];
  override payloadExample = {
    user_id: '123456789',
    msg_id: '123',
    save_path: 'C:\\save'
  };
  override returnExample = null;

  async _handle (payload: ReceiveOnlineFilePayload) {
    // 默认下载路径
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('User not found');

    const peer = { chatType: ChatType.KCHATTYPEC2C, peerUid: uid };

    return await this.core.apis.OnlineApi.receiveOnlineFileOrFolder(peer, payload.msg_id, payload.element_id);
  }
}
