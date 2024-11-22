import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/message-unique';

const SchemaData = {
    type: 'object',
    properties: {
        message_id: { type: ['string', 'number'] },
        emoji_id: { type: ['string', 'number'] },
        set: { type: ['boolean', 'string'] }
    },
    required: ['message_id', 'emoji_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetMsgEmojiLike extends OneBotAction<Payload, any> {
    actionName = ActionName.SetMsgEmojiLike;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const msg = MessageUnique.getMsgIdAndPeerByShortId(parseInt(payload.message_id.toString()));
        if (!msg) {
            throw new Error('msg not found');
        }
        if (!payload.emoji_id) {
            throw new Error('emojiId not found');
        }
        payload.set = payload.set ?? true;

        const msgData = (await this.core.apis.MsgApi.getMsgsByMsgId(msg.Peer, [msg.MsgId])).msgList;
        if (!msgData || msgData.length === 0 || !msgData[0].msgSeq) {
            throw new Error('find msg by msgid error');
        }

        return await this.core.apis.MsgApi.setEmojiLike(
            msg.Peer,
            msgData[0].msgSeq,
            payload.emoji_id.toString(),
            typeof payload.set === 'boolean'
                ? payload.set
                : (typeof payload.set === 'string'
                    ? payload.set === 'true'
                    : !!payload.set)
        );
    }
}
