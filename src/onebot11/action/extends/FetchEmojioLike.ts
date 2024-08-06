//getMsgEmojiLikesList
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQMsgApi } from '@/core/apis';
import { MessageUnique } from '@/common/utils/MessageUnique';
const SchemaData = {
  type: 'object',
  properties: {
    user_id: { type: 'string' },
    group_id: { type: 'string' },
    emojiId: { type: 'string' },
    emojiType: { type: 'string' },
    message_id: { type: ['string', 'number'] },
    count: { type: 'number' }
  },
  required: ['emojiId', 'emojiType', 'message_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class FetchEmojioLike extends BaseAction<Payload, any> {
  actionName = ActionName.FetchEmojioLike;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    const msgIdPeer = MessageUnique.getMsgIdAndPeerByShortId(parseInt(payload.message_id.toString()));
    if(!msgIdPeer) throw new Error('消息不存在');
    const msg = (await NTQQMsgApi.getMsgsByMsgId(msgIdPeer.Peer, [msgIdPeer.MsgId])).msgList[0];
    const ret = await NTQQMsgApi.getMsgEmojiLikesList(msgIdPeer.Peer,msg.msgSeq,payload.emojiId,payload.emojiType,payload.count);
    return ret;
  }
}
