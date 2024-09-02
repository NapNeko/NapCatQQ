import { ActionName } from '../types';
import BaseAction from '../BaseAction';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/message-unique';

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
        const msg = MessageUnique.getMsgIdAndPeerByShortId(Number(payload.message_id));
        if (msg) {
            const ret = this.core.eventWrapper.registerListen(
                'NodeIKernelMsgListener/onMsgInfoListUpdate',
                1,
                1000,
                (msgs) => !!msgs.find(m => m.msgId === msg.MsgId && m.recallTime !== '0'),
            ).catch(() => undefined);
            await this.core.apis.MsgApi.recallMsg(msg.Peer, [msg.MsgId]);
            const data = await ret;
            if (!data) throw new Error('Recall failed');
        } else {
            throw new Error('Recall failed');
        }
    }
}

export default DeleteMsg;
