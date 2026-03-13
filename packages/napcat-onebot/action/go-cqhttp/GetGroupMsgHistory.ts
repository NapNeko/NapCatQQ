import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { OB11Message } from '@/napcat-onebot/index';
import { ActionName } from '@/napcat-onebot/action/router';
import { ChatType, Peer } from 'napcat-core/types';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { GoCQHTTPActionsExamples } from '../example/GoCQHTTPActionsExamples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
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
}, { description: '群历史消息' });

type ReturnType = Static<typeof ReturnSchema>;

export default class GoCQHTTPGetGroupMsgHistory extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_GetGroupMsgHistory;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群历史消息';
  override actionDescription = '获取指定群聊的历史聊天记录';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.GetGroupMsgHistory.payload;
  override returnExample = GoCQHTTPActionsExamples.GetGroupMsgHistory.response;

  async _handle (payload: PayloadType, _adapter: string, config: NetworkAdapterConfig): Promise<ReturnType> {
    const peer: Peer = { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id.toString() };
    const hasMessageSeq = !payload.message_seq ? !!payload.message_seq : !(payload.message_seq?.toString() === '' || payload.message_seq?.toString() === '0');
    // 拉取消息
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
      msgList.map(msg => this.obContext.apis.MsgApi.parseMessage(msg, config.messagePostFormat, payload.parse_mult_msg, payload.disable_get_url, payload.quick_reply)))
    ).filter((msg): msg is OB11Message => msg !== undefined);
    return { messages: ob11MsgList };
  }
}
