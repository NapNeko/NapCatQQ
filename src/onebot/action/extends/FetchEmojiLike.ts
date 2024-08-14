//getMsgEmojiLikesList
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { MessageUnique } from '@/common/utils/MessageUnique';

const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: 'string' },
        group_id: { type: 'string' },
        emojiId: { type: 'string' },
        emojiType: { type: 'string' },
        message_id: { type: ['string', 'number'] },
        count: { type: 'number' },
    },
    required: ['emojiId', 'emojiType', 'message_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class FetchEmojiLike extends BaseAction<Payload, any> {
    actionName = ActionName.FetchEmojiLike;
    PayloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const NTQQMsgApi = this.CoreContext.apis.MsgApi;
        const msgIdPeer = MessageUnique.getMsgIdAndPeerByShortId(parseInt(payload.message_id.toString()));
        if (!msgIdPeer) throw new Error('消息不存在');
        const msg = (await NTQQMsgApi.getMsgsByMsgId(msgIdPeer.Peer, [msgIdPeer.MsgId])).msgList[0];
        return await NTQQMsgApi.getMsgEmojiLikesList(msgIdPeer.Peer, msg.msgSeq, payload.emojiId, payload.emojiType, payload.count);
    }
}
