import { MessageUnique } from 'napcat-common/src/message-unique';
import { ChatType, Peer } from 'napcat-core';
import { Static, Type } from '@sinclair/typebox';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';

export const GroupTodoPayloadSchema = Type.Object({
  group_id: Type.Union([Type.String(), Type.Number()], { description: '群号' }),
  message_id: Type.Optional(Type.String({ description: '消息ID' })),
  message_seq: Type.Optional(Type.String({ description: '消息Seq (可选)' })),
});

export type GroupTodoPayload = Static<typeof GroupTodoPayloadSchema>;

export abstract class BaseGroupTodoAction extends GetPacketStatusDepends<GroupTodoPayload, void> {
  override payloadSchema = GroupTodoPayloadSchema;
  override returnSchema = Type.Null();
  override actionTags = ['核心接口'];

  protected abstract handleGroupTodo(groupId: number, msgSeq: string): Promise<void>;

  async _handle (payload: GroupTodoPayload) {
    const groupId = +payload.group_id;
    if (payload.message_seq) {
      return await this.handleGroupTodo(groupId, payload.message_seq.toString());
    }
    if (!payload.message_id) {
      throw new Error('缺少参数 message_id 或 message_seq');
    }
    const peer: Peer = {
      chatType: ChatType.KCHATTYPEGROUP,
      peerUid: payload.group_id.toString(),
    };
    const { MsgId, Peer } = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id) ?? { Peer: peer, MsgId: payload.message_id.toString() };
    const msg = (await this.core.apis.MsgApi.getMsgsByMsgId(Peer, [MsgId])).msgList[0];
    if (!msg) {
      throw new Error('消息不存在');
    }
    await this.handleGroupTodo(groupId, msg.msgSeq);
  }
}
