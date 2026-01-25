import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ChatType, Peer } from 'napcat-core/types';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  message_id: Type.Union([Type.Number(), Type.String()], { description: '消息ID' }),
  group_id: Type.Optional(Type.String({ description: '目标群号' })),
  user_id: Type.Optional(Type.String({ description: '目标用户QQ' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

class ForwardSingleMsg extends OneBotAction<PayloadType, ReturnType> {
  override actionSummary = '转发单条消息';
  override actionDescription = '转发单条消息';
  override actionTags = ['消息接口'];
  override payloadExample = {
    message_id: 12345,
    group_id: '123456'
  };
  override returnExample = {};

  protected async getTargetPeer (payload: PayloadType): Promise<Peer> {
    if (payload.user_id) {
      const peerUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
      if (!peerUid) {
        throw new Error(`无法找到私聊对象${payload.user_id}`);
      }
      return { chatType: ChatType.KCHATTYPEC2C, peerUid };
    }
    return { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id!.toString() };
  }

  async _handle (payload: PayloadType): Promise<null> {
    const msg = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id);
    if (!msg) {
      throw new Error(`无法找到消息${payload.message_id}`);
    }
    const peer = await this.getTargetPeer(payload);
    const ret = await this.core.apis.MsgApi.forwardMsg(msg.Peer,
      peer,
      [msg.MsgId]
    );
    if (ret.result !== 0) {
      throw new Error(`转发消息失败 ${ret.errMsg}`);
    }
    return null;
  }
}

export class ForwardFriendSingleMsg extends ForwardSingleMsg {
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionName = ActionName.ForwardFriendSingleMsg;
}

export class ForwardGroupSingleMsg extends ForwardSingleMsg {
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionName = ActionName.ForwardGroupSingleMsg;
}
