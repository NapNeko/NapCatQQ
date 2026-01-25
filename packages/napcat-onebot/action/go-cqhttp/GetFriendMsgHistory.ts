import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { OB11Message } from '@/napcat-onebot/index';
import { ActionName } from '@/napcat-onebot/action/router';
import { ChatType } from 'napcat-core/types';
import { MessageUnique } from 'napcat-common/src/message-unique';

import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';

const PayloadSchema = Type.Object({
  user_id: Type.String({ description: '用户QQ' }),
  message_seq: Type.Optional(Type.String({ description: '起始消息序号' })),
  count: Type.Number({ default: 20, description: '获取消息数量' }),
  reverse_order: Type.Boolean({ default: false, description: '是否反向排序' }),
  disable_get_url: Type.Boolean({ default: false, description: '是否禁用获取URL' }),
  parse_mult_msg: Type.Boolean({ default: true, description: '是否解析合并消息' }),
  quick_reply: Type.Boolean({ default: false, description: '是否快速回复' }),
  reverseOrder: Type.Boolean({ default: false, description: '是否反向排序(旧版本兼容)' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  messages: Type.Array(Type.Any(), { description: '消息列表' }),
}, { description: '好友历史消息' });

type ReturnType = Static<typeof ReturnSchema>;

export default class GetFriendMsgHistory extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetFriendMsgHistory;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType, _adapter: string, config: NetworkAdapterConfig): Promise<ReturnType> {
    // 处理参数
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error(`记录${payload.user_id}不存在`);
    const friend = await this.core.apis.FriendApi.isBuddy(uid);
    const peer = { chatType: friend ? ChatType.KCHATTYPEC2C : ChatType.KCHATTYPETEMPC2CFROMGROUP, peerUid: uid };
    const hasMessageSeq = !payload.message_seq ? !!payload.message_seq : !(payload.message_seq?.toString() === '' || payload.message_seq?.toString() === '0');
    const startMsgId = hasMessageSeq ? (MessageUnique.getMsgIdAndPeerByShortId(+payload.message_seq!)?.MsgId ?? payload.message_seq!.toString()) : '0';
    const msgList = hasMessageSeq
      ? (await this.core.apis.MsgApi.getMsgHistory(peer, startMsgId, +payload.count, payload.reverse_order || payload.reverseOrder)).msgList
      : (await this.core.apis.MsgApi.getAioFirstViewLatestMsgs(peer, +payload.count)).msgList;
    if (msgList.length === 0) throw new Error(`消息${payload.message_seq}不存在`);
    // 转换序号
    await Promise.all(msgList.map(async msg => {
      msg.id = MessageUnique.createUniqueMsgId({ guildId: '', chatType: msg.chatType, peerUid: msg.peerUid }, msg.msgId);
    }));
    // 烘焙消息
    const ob11MsgList = (await Promise.all(
      msgList.map(msg => this.obContext.apis.MsgApi.parseMessage(msg, config.messagePostFormat, payload.parse_mult_msg, payload.disable_get_url)))
    ).filter((msg): msg is OB11Message => msg !== undefined);
    return { messages: ob11MsgList };
  }
}
