import { NTQQMsgApi } from '@/core/apis';
import { ActionName } from '../types';
import BaseAction from '../BaseAction';
import { dbUtil } from '@/common/utils/db';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

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
    const msg = await dbUtil.getMsgByShortId(Number(payload.message_id));
    if (msg) {
      await NTQQMsgApi.recallMsg({ peerUid: msg.peerUid, chatType: msg.chatType }, [msg.msgId]);
    }
  }
}

export default DeleteMsg;
