import { NTQQMsgApi } from '@/core/apis';
import { ActionName } from '../types';
import BaseAction from '../BaseAction';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { sleep } from '@/common/utils/helper';
import { NTEventDispatch } from '@/common/utils/EventTask';
import { NodeIKernelMsgListener } from '@/core';

const SchemaData = {
  type: 'object',
  properties: {
    message_id: {
      oneOf: [
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
    const msg = MessageUnique.getMsgIdAndPeerByShortId(Number(payload.message_id));
    if (msg) {
      let ret = NTEventDispatch.RegisterListen<NodeIKernelMsgListener['onMsgInfoListUpdate']>
        (
          'NodeIKernelMsgListener/onMsgInfoListUpdate',
          1,
          5000,
          (msgs) => {
            if (msgs.some(m => m.msgId === msg.MsgId)) {
              return true;
            }
            return false;
          }
        ).catch(e => new Promise<undefined>((resolve, reject) => { resolve(undefined) }));
      await NTQQMsgApi.recallMsg(msg.Peer, [msg.MsgId]);
      let data = await ret;
      if (!data) {
        throw new Error('Recall failed');
      }
      
      //await sleep(100);
      //await NTQQMsgApi.getMsgsByMsgId(msg.Peer, [msg.MsgId]);
    }
  }
}

export default DeleteMsg;
