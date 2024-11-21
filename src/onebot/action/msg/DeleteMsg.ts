import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '@/onebot/action/OneBotAction';
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

class DeleteMsg extends OneBotAction<Payload, void> {
    actionName = ActionName.DeleteMsg;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const msg = MessageUnique.getMsgIdAndPeerByShortId(Number(payload.message_id));
        if (msg) {
            await this.core.apis.MsgApi.recallMsg(msg.Peer, msg.MsgId);
        } else {
            throw new Error('Recall failed');
        }
    }
}

export default DeleteMsg;
