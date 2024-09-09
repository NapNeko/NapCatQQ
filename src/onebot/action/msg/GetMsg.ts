import { OB11Message } from '@/onebot';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/message-unique';


export type ReturnDataType = OB11Message

const SchemaData = {
    type: 'object',
    properties: {
        message_id: { type: ['number', 'string'] },
    },
    required: ['message_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetMsg extends BaseAction<Payload, OB11Message> {
    actionName = ActionName.GetMsg;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        // log("history msg ids", Object.keys(msgHistory));
        if (!payload.message_id) {
            throw Error('参数message_id不能为空');
        }
        const MsgShortId = MessageUnique.getShortIdByMsgId(payload.message_id.toString());
        const msgIdWithPeer = MessageUnique.getMsgIdAndPeerByShortId(MsgShortId || parseInt(payload.message_id.toString()));
        if (!msgIdWithPeer) {
            throw new Error('消息不存在');
        }
        const peer = { guildId: '', peerUid: msgIdWithPeer?.Peer.peerUid, chatType: msgIdWithPeer.Peer.chatType };
        const msg = await this.core.apis.MsgApi.getMsgsByMsgId(
            peer,
            [msgIdWithPeer?.MsgId || payload.message_id.toString()]);
        const retMsg = await this.obContext.apis.MsgApi.parseMessage(msg.msgList[0]);
        if (!retMsg) throw Error('消息为空');
        try {
            retMsg.message_id = MessageUnique.createUniqueMsgId(peer, msg.msgList[0].msgId)!;
            retMsg.message_seq = retMsg.message_id;
            retMsg.real_id = retMsg.message_id;
        } catch (e) {
            // ignored
        }
        return retMsg;
    }
}

export default GetMsg;
