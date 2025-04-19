import { z } from 'zod';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { MessageUnique } from '@/common/message-unique';
import { type NTQQMsgApi } from '@/core/apis';
import { actionType } from '@/common/coerce';
const SchemaData = z.object({
    message_id: actionType.string(),
    emojiId: actionType.string(),
    emojiType: actionType.string(),
    count: actionType.number().default(20),
});

type Payload = z.infer<typeof SchemaData>;

export class FetchEmojiLike extends OneBotAction<Payload, Awaited<ReturnType<NTQQMsgApi['getMsgEmojiLikesList']>>> {
    override actionName = ActionName.FetchEmojiLike;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const msgIdPeer = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id);
        if (!msgIdPeer) throw new Error('消息不存在');
        const msg = (await this.core.apis.MsgApi.getMsgsByMsgId(msgIdPeer.Peer, [msgIdPeer.MsgId])).msgList[0];
        if (!msg) throw new Error('消息不存在');
        return await this.core.apis.MsgApi.getMsgEmojiLikesList(
            msgIdPeer.Peer, msg.msgSeq, payload.emojiId, payload.emojiType, +payload.count
        );
    }
}
