import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';

import { MsgActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  message_id: Type.Union([Type.Number(), Type.String()], { description: '消息ID' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  time: Type.Number({ description: '发送时间' }),
  message_type: Type.String({ description: '消息类型' }),
  message_id: Type.Number({ description: '消息ID' }),
  real_id: Type.Number({ description: '真实ID' }),
  message_seq: Type.Number({ description: '消息序号' }),
  sender: Type.Any({ description: '发送者' }),
  message: Type.Any({ description: '消息内容' }),
  raw_message: Type.String({ description: '原始消息内容' }),
  font: Type.Number({ description: '字体' }),
  group_id: Type.Optional(Type.Union([Type.Number(), Type.String()], { description: '群号' })),
  user_id: Type.Union([Type.Number(), Type.String()], { description: '发送者QQ号' }),
  emoji_likes_list: Type.Optional(Type.Array(Type.Any(), { description: '表情回应列表' })),
}, { description: 'OneBot 11 消息' });

type ReturnType = Static<typeof ReturnSchema>;

class GetMsg extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetMsg;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取消息';
  override actionDescription = '根据消息 ID 获取消息详细信息';
  override actionTags = ['消息接口'];
  override payloadExample = MsgActionsExamples.GetMsg.payload;
  override returnExample = MsgActionsExamples.GetMsg.response;

  async _handle (payload: PayloadType, _adapter: string, config: NetworkAdapterConfig) {
    if (!payload.message_id) {
      throw Error('参数message_id不能为空');
    }
    const MsgShortId = MessageUnique.getShortIdByMsgId(payload.message_id.toString());
    const msgIdWithPeer = MessageUnique.getMsgIdAndPeerByShortId(MsgShortId ?? +payload.message_id);
    if (!msgIdWithPeer) {
      throw new Error('消息不存在');
    }
    const peer = { guildId: '', peerUid: msgIdWithPeer?.Peer.peerUid, chatType: msgIdWithPeer.Peer.chatType };
    const msg = (await this.core.apis.MsgApi.getMsgsByMsgId(peer, [msgIdWithPeer?.MsgId || payload.message_id.toString()])).msgList[0];
    if (!msg) throw Error('消息不存在');
    const retMsg = await this.obContext.apis.MsgApi.parseMessage(msg, config.messagePostFormat);
    if (!retMsg) throw Error('消息为空');
    retMsg.emoji_likes_list = [];
    msg.emojiLikesList?.map(emoji => {
      retMsg.emoji_likes_list?.push({
        emoji_id: emoji.emojiId,
        emoji_type: emoji.emojiType,
        likes_cnt: emoji.likesCnt,
      });
    });
    try {
      retMsg.message_id = MessageUnique.createUniqueMsgId(peer, msg.msgId)!;
      retMsg.message_seq = retMsg.message_id;
      retMsg.real_id = retMsg.message_id;
    } catch {
      // ignored
    }
    return retMsg;
  }
}

export default GetMsg;
