import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';
import { SatoriMessage, SatoriChannelType } from '../../types';
import { ChatType, SendMessageElement } from 'napcat-core';

const SchemaData = Type.Object({
  channel_id: Type.String(),
  content: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class MessageCreateAction extends SatoriAction<Payload, SatoriMessage[]> {
  actionName = SatoriActionName.MessageCreate;
  override payloadSchema = SchemaData;

  protected async _handle (payload: Payload): Promise<SatoriMessage[]> {
    const { channel_id, content } = payload;

    // 解析 channel_id，格式: private:{user_id} 或 group:{group_id}
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

    // 解析 Satori 消息内容为 NapCat 消息元素
    const elements = await this.satoriAdapter.apis.MsgApi.parseContent(content);

    // 发送消息
    const result = await this.core.apis.MsgApi.sendMsg(
      { chatType, peerUid, guildId: '' },
      elements as SendMessageElement[],
      30000
    );

    if (!result) {
      throw new Error('消息发送失败: 未知错误');
    }

    // 构造返回结果
    const message: SatoriMessage = {
      id: result.msgId,
      content,
      channel: {
        id: channel_id,
        type: type === 'private' ? SatoriChannelType.DIRECT : SatoriChannelType.TEXT,
      },
      user: {
        id: this.selfInfo.uin,
        name: this.selfInfo.nick,
      },
      created_at: Date.now(),
    };

    return [message];
  }
}
