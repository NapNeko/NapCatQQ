import { ChatType, Peer } from 'napcat-core/types';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  user_id: Type.Optional(Type.Union([Type.String(), Type.Number()], { description: '用户QQ' })),
  group_id: Type.Optional(Type.String({ description: '群号' })),
  message_id: Type.Optional(Type.String({ description: '消息ID' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

class MarkMsgAsRead extends OneBotAction<PayloadType, ReturnType> {
  override actionSummary = '标记消息已读';
  override actionDescription = '标记指定渠道的消息为已读';
  override actionTags = ['消息接口'];
  override payloadExample = {
    message_id: 12345
  };
  override returnExample = null;

  async getPeer (payload: PayloadType): Promise<Peer> {
    if (payload.message_id) {
      const s_peer = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id)?.Peer;
      if (s_peer) {
        return s_peer;
      }
      const l_peer = MessageUnique.getPeerByMsgId(payload.message_id.toString())?.Peer;
      if (l_peer) {
        return l_peer;
      }
    }
    if (payload.user_id) {
      const peerUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
      if (!peerUid) {
        throw new Error(`私聊${payload.user_id}不存在`);
      }
      const isBuddy = await this.core.apis.FriendApi.isBuddy(peerUid);
      return { chatType: isBuddy ? ChatType.KCHATTYPEC2C : ChatType.KCHATTYPETEMPC2CFROMGROUP, peerUid };
    }
    if (!payload.group_id) {
      throw new Error('缺少参数 group_id 或 user_id');
    }
    return { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id.toString() };
  }

  async _handle (payload: PayloadType): Promise<null> {
    const ret = await this.core.apis.MsgApi.setMsgRead(await this.getPeer(payload));
    if (ret.result !== 0) {
      throw new Error('设置已读失败,' + ret.errMsg);
    }
    return null;
  }
}

// 以下为非标准实现
export class MarkPrivateMsgAsRead extends MarkMsgAsRead {
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionName = ActionName.MarkPrivateMsgAsRead;
  override actionSummary = '标记私聊已读';
}

export class MarkGroupMsgAsRead extends MarkMsgAsRead {
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionName = ActionName.MarkGroupMsgAsRead;
  override actionSummary = '标记群聊已读';
}

export class GoCQHTTPMarkMsgAsRead extends MarkMsgAsRead {
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionName = ActionName.GoCQHTTP_MarkMsgAsRead;
  override actionSummary = '标记消息已读 (Go-CQHTTP)';
}

export class MarkAllMsgAsRead extends OneBotAction<void, null> {
  override actionName = ActionName._MarkAllMsgAsRead;
  override actionSummary = '标记所有消息已读';
  override actionTags = ['消息接口'];
  override payloadExample = {};
  override returnExample = null;

  async _handle (): Promise<null> {
    await this.core.apis.MsgApi.markAllMsgAsRead();
    return null;
  }
}
