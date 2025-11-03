import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { MessageUnique } from '@/common/message-unique';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  message_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
  msg_seq: Type.Optional(Type.String()),
  msg_random: Type.Optional(Type.String()),
  group_id: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;
export default class DelEssenceMsg extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.DelEssenceMsg;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload): Promise<unknown> {
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
      const { msg_seq, msg_random, group_id } = JSON.parse(data) as { msg_seq: string, msg_random: string, group_id: string };
      return await this.core.apis.GroupApi.removeGroupEssenceBySeq(group_id, msg_seq, msg_random);
    }
    return await this.core.apis.GroupApi.removeGroupEssence(
      msg.Peer.peerUid,
      msg.MsgId
    );
  }
}
