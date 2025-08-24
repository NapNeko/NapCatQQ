
import { MessageUnique } from '@/common/message-unique';
import { ChatType, Peer } from '@/core';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '../router';

const SchemaData = Type.Object({
    group_id: Type.String(),
    message_id: Type.String(),
    message_seq: Type.Optional(Type.String())
});

type Payload = Static<typeof SchemaData>;
export class SetGroupTodo extends GetPacketStatusDepends<Payload, void> {
    override payloadSchema = SchemaData;
    override actionName = ActionName.SetGroupTodo;
    async _handle(payload: Payload) {
        if (payload.message_seq) {
            return await this.core.apis.PacketApi.pkt.operation.SetGroupTodo(+payload.group_id, payload.message_seq);
        }
        const peer: Peer = {
            chatType: ChatType.KCHATTYPEGROUP,
            peerUid: payload.group_id
        };
        const { MsgId, Peer } = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id) ?? { Peer: peer, MsgId: payload.message_id };
        let msg = (await this.core.apis.MsgApi.getMsgsByMsgId(Peer, [MsgId])).msgList[0];
        if (!msg) throw new Error('消息不存在');
        await this.core.apis.PacketApi.pkt.operation.SetGroupTodo(+payload.group_id, msg.msgSeq);
    }
}