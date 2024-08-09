import { ActionName } from '../types';
import BaseAction from '../BaseAction';
import { NTQQMsgApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/MessageUnique';

const SchemaData = {
    type: 'object',
    properties: {
        message_id: { type: ['string', 'number'] },
        emoji_id: { type: ['string', 'number'] }
    },
    required: ['message_id', 'emoji_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetMsgEmojiLike extends BaseAction<Payload, any> {
    actionName = ActionName.SetMsgEmojiLike;
    PayloadSchema = SchemaData;
    protected async _handle(payload: Payload) {
        const NTQQMsgApi = this.CoreContext.getApiContext().MsgApi;
        const msg = MessageUnique.getMsgIdAndPeerByShortId(parseInt(payload.message_id.toString()));
        if (!msg) {
            throw new Error('msg not found');
        }
        if (!payload.emoji_id) {
            throw new Error('emojiId not found');
        }
        const msgData = (await NTQQMsgApi.getMsgsByMsgId(msg.Peer, [msg.MsgId])).msgList;
        if (!msgData || msgData.length == 0 || !msgData[0].msgSeq) {
            throw new Error('find msg by msgid error');
        }
        return await NTQQMsgApi.setEmojiLike(msg.Peer, msgData[0].msgSeq, payload.emoji_id.toString(), true);
    }
}
