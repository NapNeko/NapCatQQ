//getMsgEmojiLikesList
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { MessageUnique } from '@/common/message-unique';

const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: 'string' },
        group_id: { type: 'string' },
        emojiId: { type: 'string' },
        emojiType: { type: 'string' },
        message_id: { type: ['string', 'number'] },
        count: { type: ['string', 'number'] },
    },
    required: ['emojiId', 'emojiType', 'message_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class FetchEmojiLike extends BaseAction<Payload, any> {
    actionName = ActionName.FetchEmojiLike;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const msgIdPeer = MessageUnique.getMsgIdAndPeerByShortId(parseInt(payload.message_id.toString()));
        if (!msgIdPeer) throw new Error('消息不存在');
        const msg = (await this.core.apis.MsgApi.getMsgsByMsgId(msgIdPeer.Peer, [msgIdPeer.MsgId])).msgList[0];
        return await this.core.apis.MsgApi.getMsgEmojiLikesList(msgIdPeer.Peer, msg.msgSeq, payload.emojiId, payload.emojiType, +(payload.count ?? 20));
    }
}
