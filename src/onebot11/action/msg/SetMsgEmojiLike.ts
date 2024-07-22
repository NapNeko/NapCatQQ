import { ActionName } from '../types';
import BaseAction from '../BaseAction';
import { NTQQMsgApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/MessageUnique';

const SchemaData = {
  type: 'object',
  properties: {
    message_id: { type: ['string','number'] },
    emoji_id: { type: ['string','number'] }
  },
  required: ['message_id', 'emoji_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetMsgEmojiLike extends BaseAction<Payload, any> {
  actionName = ActionName.SetMsgEmojiLike;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    const msg = MessageUnique.getMsgIdAndPeerByShortId(parseInt(payload.message_id.toString()));
    if (!msg) {
      throw new Error('msg not found');
    }
    if (!payload.emoji_id){
      throw new Error('emojiId not found');
    }
    const msgSeq = (await NTQQMsgApi.getMsgsByMsgId(msg.Peer, [msg.MsgId])).msgList[0].msgSeq;
    return await NTQQMsgApi.setEmojiLike(msg.Peer, msgSeq, payload.emoji_id.toString(), true);
  }
}
