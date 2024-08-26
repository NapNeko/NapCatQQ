import { ActionName } from '../types';
import BaseAction from '../BaseAction';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/message-unique';
import { NodeIKernelMsgListener } from '@/core';

const SchemaData = {
    type: 'object',
    properties: {
        message_id: {
            oneOf: [
                { type: 'number' },
                { type: 'string' },
            ],
        },
    },
    required: ['message_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class DeleteMsg extends BaseAction<Payload, void> {
    actionName = ActionName.DeleteMsg;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQMsgApi = this.core.apis.MsgApi;
        const msg = MessageUnique.getMsgIdAndPeerByShortId(Number(payload.message_id));
        if (msg) {
            const ret = this.core.eventWrapper.registerListen(
                'NodeIKernelMsgListener/onMsgInfoListUpdate',
                1,
                5000,
                (msgs) => !!msgs.find(m => m.msgId === msg.MsgId && m.recallTime !== '0'),
            ).catch(() => new Promise<undefined>((resolve) => {
                resolve(undefined);
            }));
            await NTQQMsgApi.recallMsg(msg.Peer, [msg.MsgId]);
            const data = await ret;
            if (!data) {
                //throw new Error('Recall failed');
            }
            //await sleep(100);
            //await NTQQMsgApi.getMsgsByMsgId(msg.Peer, [msg.MsgId]);
        }
    }
}

export default DeleteMsg;
