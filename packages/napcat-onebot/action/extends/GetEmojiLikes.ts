import { Type, Static } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Peer, ChatType } from '@/napcat-core';

const PayloadSchema = Type.Object({
  group_id: Type.Optional(Type.String({ description: '群号，短ID可不传' })),
  message_id: Type.String({ description: '消息ID，可以传递长ID或短ID' }),
  emoji_id: Type.String({ description: '表情ID' }),
  emoji_type: Type.Optional(Type.String({ description: '表情类型' })),
  count: Type.Number({ default: 0, description: '数量，0代表全部' }),
});
type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  emoji_like_list: Type.Array(
    Type.Object({
      user_id: Type.String({ description: '点击者QQ号' }),
      nick_name: Type.String({ description: '昵称?' }),
    }),
    { description: '表情回应列表' }
  ),
});
type ReturnType = Static<typeof ReturnSchema>;

export class GetEmojiLikes extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetEmojiLikes;
  override actionSummary = '获取消息表情点赞列表';
  override actionTags = ['消息扩展'];
  override payloadExample = {
    message_id: 12345
  };
  override returnExample = {
    likes: [{ emoji_id: '123', user_id: 654321 }]
  };
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    let peer: Peer;
    let msgId: string;

    if (MessageUnique.isShortId(payload.message_id)) {
      const msgIdPeer = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id);
      if (!msgIdPeer) throw new Error('消息不存在');
      peer = msgIdPeer.Peer;
      msgId = msgIdPeer.MsgId;
    } else {
      if (!payload.group_id) throw new Error('长ID模式下必须提供群号');
      peer = { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id };
      msgId = payload.message_id;
    }

    const msg = (await this.core.apis.MsgApi.getMsgsByMsgId(peer, [msgId])).msgList[0];
    if (!msg) throw new Error('消息不存在');

    const emojiType = payload.emoji_type ?? (payload.emoji_id.length > 3 ? '2' : '1');
    const emojiLikeList: Array<{ user_id: string; nick_name: string; }> = [];
    let cookie = '';
    let needFetchCount = payload.count == 0 ? 200 : Math.ceil(payload.count / 15);
    for (let page = 0; page < needFetchCount; page++) {
      const res = await this.core.apis.MsgApi.getMsgEmojiLikesList(
        peer, msg.msgSeq, payload.emoji_id.toString(), emojiType, cookie, 15
      );

      if (Array.isArray(res.emojiLikesList)) {
        for (const like of res.emojiLikesList) {
          emojiLikeList.push({ user_id: like.tinyId, nick_name: like.nickName });
        }
      }

      if (res.isLastPage || !res.cookie) break;
      cookie = res.cookie;
    }
    // 切断多余部分
    if (payload.count > 0) {
      emojiLikeList.splice(payload.count);
    }
    return { emoji_like_list: emojiLikeList };
  }
}
