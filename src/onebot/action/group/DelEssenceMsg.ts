import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/MessageUnique';

const SchemaData = {
    type: 'object',
    properties: {
        message_id: { type: ['number', 'string'] },
    },
    required: ['message_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class DelEssenceMsg extends BaseAction<Payload, any> {
    actionName = ActionName.DelEssenceMsg;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<any> {
        const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
        const msg = MessageUnique.getMsgIdAndPeerByShortId(parseInt(payload.message_id.toString()));
        if (!msg) {
            throw new Error('msg not found');
        }
        return await NTQQGroupApi.removeGroupEssence(
            msg.Peer.peerUid,
            msg.MsgId,
        );
    }
}
