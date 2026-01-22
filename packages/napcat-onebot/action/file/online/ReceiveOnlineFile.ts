import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ChatType } from 'napcat-core/types';

const SchemaData = Type.Object({
  user_id: Type.Union([Type.Number(), Type.String()]),
  msg_id: Type.String(),
  element_id: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class ReceiveOnlineFile extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.ReceiveOnlineFile;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    // 默认下载路径
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('User not found');

    const peer = { chatType: ChatType.KCHATTYPEC2C, peerUid: uid };

    return await this.core.apis.OnlineApi.receiveOnlineFileOrFolder(peer, payload.msg_id, payload.element_id);
  }
}
