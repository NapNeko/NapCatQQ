import { MessageUnique } from 'napcat-common/src/message-unique';
import { ChatType, Peer } from 'napcat-core';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '../router';

export const SetGroupTodoPayloadSchema = Type.Object({
  group_id: Type.Union([Type.String(), Type.Number()], { description: '群号' }),
  message_id: Type.Union([Type.String(), Type.Number()], { description: '消息ID' }),
  message_seq: Type.Optional(Type.Union([Type.String(), Type.Number()], { description: '消息Seq (可选)' })),
});

export type SetGroupTodoPayload = Static<typeof SetGroupTodoPayloadSchema>;
export class SetGroupTodo extends GetPacketStatusDepends<SetGroupTodoPayload, void> {
  override payloadSchema = SetGroupTodoPayloadSchema;
  override returnSchema = Type.Null();
  override actionName = ActionName.SetGroupTodo;
  async _handle (payload: SetGroupTodoPayload) {
    if (payload.message_seq) {
      return await this.core.apis.PacketApi.pkt.operation.SetGroupTodo(+payload.group_id, payload.message_seq.toString());
    }
    const peer: Peer = {
      chatType: ChatType.KCHATTYPEGROUP,
      peerUid: payload.group_id.toString(),
    };
    const { MsgId, Peer } = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id) ?? { Peer: peer, MsgId: payload.message_id.toString() };
    const msg = (await this.core.apis.MsgApi.getMsgsByMsgId(Peer, [MsgId])).msgList[0];
    if (!msg) throw new Error('消息不存在');
    await this.core.apis.PacketApi.pkt.operation.SetGroupTodo(+payload.group_id, msg.msgSeq);
  }
}
