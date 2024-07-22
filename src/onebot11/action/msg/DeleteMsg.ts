import { NTQQMsgApi } from '@/core/apis';
import { ActionName } from '../types';
import BaseAction from '../BaseAction';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/MessageUnique';

const SchemaData = {
  type: 'object',
  properties: {
    message_id: {
      oneOf:[
        { type: 'number' },
        { type: 'string' }
      ]
    }
  },
  required: ['message_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class DeleteMsg extends BaseAction<Payload, void> {
  actionName = ActionName.DeleteMsg;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    const msg = await MessageUnique.getMsgIdAndPeerByShortId(Number(payload.message_id));
    if (msg) {
      await NTQQMsgApi.recallMsg(msg.Peer, [msg.MsgId]);
    }
  }
}

export default DeleteMsg;
