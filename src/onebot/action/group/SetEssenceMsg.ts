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

export default class SetEssenceMsg extends BaseAction<Payload, any> {
    actionName = ActionName.SetEssenceMsg;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<any> {
        const NTQQGroupApi = this.core.apis.GroupApi;
        const msg = MessageUnique.getMsgIdAndPeerByShortId(parseInt(payload.message_id.toString()));
        if (!msg) {
            throw new Error('msg not found');
        }
        return await NTQQGroupApi.addGroupEssence(
            msg.Peer.peerUid,
            msg.MsgId,
        );
    }
}
