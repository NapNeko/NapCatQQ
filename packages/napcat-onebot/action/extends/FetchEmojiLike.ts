import { Type, Static } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';

const PayloadSchema = Type.Object({
  message_id: Type.Union([Type.Number(), Type.String()], { description: '消息ID' }),
  emojiId: Type.Union([Type.Number(), Type.String()], { description: '表情ID' }),
  emojiType: Type.Union([Type.Number(), Type.String()], { description: '表情类型' }),
  count: Type.Union([Type.Number(), Type.String()], { default: 20, description: '获取数量' }),
  cookie: Type.String({ default: '', description: '分页Cookie' })
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  emojiLikesList: Type.Array(Type.Object({
    tinyId: Type.String({ description: 'TinyID' }),
    nickName: Type.String({ description: '昵称' }),
    headUrl: Type.String({ description: '头像URL' }),
  }), { description: '表情回应列表' }),
  cookie: Type.String({ description: '分页Cookie' }),
  isLastPage: Type.Boolean({ description: '是否最后一页' }),
  isFirstPage: Type.Boolean({ description: '是否第一页' }),
  result: Type.Number({ description: '结果状态码' }),
  errMsg: Type.String({ description: '错 误信息' }),
}, { description: '表情回应详情' });

type ReturnType = Static<typeof ReturnSchema>;

export class FetchEmojiLike extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.FetchEmojiLike;
  override actionSummary = '获取表情点赞详情';
  override actionTags = ['消息扩展'];
  override payloadExample = {
    message_id: 12345,
    emojiId: '123',
    emojiType: 1,
    count: 10,
    cookie: ''
  };
  override returnExample = {
    emojiLikesList: [
      {
        tinyId: '123456',
        nickName: '测试用户',
        headUrl: 'http://example.com/avatar.png'
      }
    ],
    cookie: '',
    isLastPage: true,
    isFirstPage: true,
    result: 0,
    errMsg: ''
  };
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const msgIdPeer = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id);
    if (!msgIdPeer) throw new Error('消息不存在');
    const msg = (await this.core.apis.MsgApi.getMsgsByMsgId(msgIdPeer.Peer, [msgIdPeer.MsgId])).msgList[0];
    if (!msg) throw new Error('消息不存在');
    const res = await this.core.apis.MsgApi.getMsgEmojiLikesList(
      msgIdPeer.Peer, msg.msgSeq, payload.emojiId.toString(), payload.emojiType.toString(), payload.cookie, +payload.count
    );
    return res;
  }
}
