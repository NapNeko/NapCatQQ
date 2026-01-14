import { SatoriAction } from '../SatoriAction';
import { ChatType } from 'napcat-core';

interface MessageDeletePayload {
  channel_id: string;
  message_id: string;
}

export class MessageDeleteAction extends SatoriAction<MessageDeletePayload, void> {
  actionName = 'message.delete';

  async handle (payload: MessageDeletePayload): Promise<void> {
    const { channel_id, message_id } = payload;

    const parts = channel_id.split(':');
    const type = parts[0];
    const id = parts[1];

    if (!type || !id) {
      throw new Error(`无效的频道ID格式: ${channel_id}`);
    }

    let chatType: ChatType;
    let peerUid: string;

    if (type === 'private') {
      chatType = ChatType.KCHATTYPEC2C;
      peerUid = await this.core.apis.UserApi.getUidByUinV2(id);
    } else if (type === 'group') {
      chatType = ChatType.KCHATTYPEGROUP;
      peerUid = id;
    } else {
      throw new Error(`不支持的频道类型: ${type}`);
    }

    const peer = { chatType, peerUid, guildId: '' };
    await this.core.apis.MsgApi.recallMsg(peer, message_id);
  }
}
