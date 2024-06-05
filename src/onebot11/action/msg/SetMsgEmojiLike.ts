import { ActionName } from '../types';
import BaseAction from '../BaseAction';
import { dbUtil } from '@/common/utils/db';
import { NTQQMsgApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

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
    const msg = await dbUtil.getMsgByShortId(parseInt(payload.message_id.toString()));
    if (!msg) {
      throw new Error('msg not found');
    }
    if (!payload.emoji_id){
      throw new Error('emojiId not found');
    }
    return await NTQQMsgApi.setEmojiLike({
      chatType: msg.chatType,
      peerUid: msg.peerUid
    }, msg.msgSeq, payload.emoji_id.toString(), true);
  }
}
