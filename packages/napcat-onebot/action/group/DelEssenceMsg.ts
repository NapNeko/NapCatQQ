import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';

import { ActionExamples } from '../examples';

const PayloadSchema = Type.Object({
  message_id: Type.Optional(Type.Union([Type.Number(), Type.String()], { description: '消息ID' })),
  msg_seq: Type.Optional(Type.String({ description: '消息序号' })),
  msg_random: Type.Optional(Type.String({ description: '消息随机数' })),
  group_id: Type.Optional(Type.String({ description: '群号' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class DelEssenceMsg extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.DelEssenceMsg;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionDescription = '移出精华消息';
  override actionTags = ['群组接口'];
  override payloadExample = ActionExamples.DelEssenceMsg.payload;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    // 如果直接提供了 msg_seq, msg_random, group_id,优先使用
    if (payload.msg_seq && payload.msg_random && payload.group_id) {
      return await this.core.apis.GroupApi.removeGroupEssenceBySeq(
        payload.group_id,
        payload.msg_random,
        payload.msg_seq
      );
    }

    // 如果没有 message_id,则必须提供 msg_seq, msg_random, group_id
    if (!payload.message_id) {
      throw new Error('必须提供 message_id 或者同时提供 msg_seq, msg_random, group_id');
    }

    const msg = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id);
    if (!msg) {
      const data = this.core.apis.GroupApi.essenceLRU.getValue(+payload.message_id);
      if (!data) throw new Error('消息不存在');
      const { msg_seq, msg_random, group_id } = JSON.parse(data) as { msg_seq: string, msg_random: string, group_id: string; };
      return await this.core.apis.GroupApi.removeGroupEssenceBySeq(group_id, msg_seq, msg_random);
    }
    return await this.core.apis.GroupApi.removeGroupEssence(
      msg.Peer.peerUid,
      msg.MsgId
    );
  }
}
