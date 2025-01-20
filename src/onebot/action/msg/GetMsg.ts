import { OB11Message } from '@/onebot';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { MessageUnique } from '@/common/message-unique';
import { RawMessage } from '@/core';
import { Static, Type } from '@sinclair/typebox';

export type ReturnDataType = OB11Message

const SchemaData = Type.Object({
    message_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

class GetMsg extends OneBotAction<Payload, OB11Message> {
    actionName = ActionName.GetMsg;
    payloadSchema = SchemaData;

    async _handle(payload: Payload, adapter: string) {
        // log("history msg ids", Object.keys(msgHistory));
        const network = Object.values(this.obContext.configLoader.configData.network);
        const msgFormat = network.flat().find(e => e.name === adapter)?.messagePostFormat ?? 'array';
        if (!payload.message_id) {
            throw Error('参数message_id不能为空');
        }
        const MsgShortId = MessageUnique.getShortIdByMsgId(payload.message_id.toString());
        const msgIdWithPeer = MessageUnique.getMsgIdAndPeerByShortId(MsgShortId ?? +payload.message_id);
        if (!msgIdWithPeer) {
            throw new Error('消息不存在');
        }
        const peer = { guildId: '', peerUid: msgIdWithPeer?.Peer.peerUid, chatType: msgIdWithPeer.Peer.chatType };
        const orimsg = this.obContext.recallMsgCache.get(msgIdWithPeer.MsgId);
        let msg: RawMessage;
        if (orimsg) {
            msg = orimsg;
        } else {
            msg = (await this.core.apis.MsgApi.getMsgsByMsgId(peer, [msgIdWithPeer?.MsgId || payload.message_id.toString()])).msgList[0];
        }
        const retMsg = await this.obContext.apis.MsgApi.parseMessage(msg, msgFormat);
        if (!retMsg) throw Error('消息为空');
        try {
            retMsg.message_id = MessageUnique.createUniqueMsgId(peer, msg.msgId)!;
            retMsg.message_seq = retMsg.message_id;
            retMsg.real_id = retMsg.message_id;
        } catch (e) {
            // ignored
        }
        return retMsg;
    }
}

export default GetMsg;
