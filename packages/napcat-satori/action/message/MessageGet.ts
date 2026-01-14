import { SatoriAction } from '../SatoriAction';
import { SatoriMessage, SatoriChannelType } from '../../types';
import { ChatType } from 'napcat-core';

interface MessageGetPayload {
  channel_id: string;
  message_id: string;
}

export class MessageGetAction extends SatoriAction<MessageGetPayload, SatoriMessage> {
  actionName = 'message.get';

  async handle (payload: MessageGetPayload): Promise<SatoriMessage> {
    const { channel_id, message_id } = payload;

    const parts = channel_id.split(':');
    const type = parts[0];
    const id = parts[1];

    if (!type || !id) {
      throw new Error(`无效的频道ID: ${channel_id}`);
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
    const msgs = await this.core.apis.MsgApi.getMsgsByMsgId(peer, [message_id]);

    if (!msgs || msgs.msgList.length === 0) {
      throw new Error('消息不存在');
    }

    const msg = msgs.msgList[0];
    if (!msg) {
      throw new Error('消息不存在');
    }

    const content = await this.satoriAdapter.apis.MsgApi.parseElements(msg.elements);

    const message: SatoriMessage = {
      id: msg.msgId,
      content,
      channel: {
        id: channel_id,
        type: type === 'private' ? SatoriChannelType.DIRECT : SatoriChannelType.TEXT,
      },
      user: {
        id: msg.senderUin,
        name: msg.sendNickName,
      },
      created_at: parseInt(msg.msgTime) * 1000,
    };

    return message;
  }
}
