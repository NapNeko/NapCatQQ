import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/message-unique';

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
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<any> {
        const msg = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id);
        if (!msg) {
            const data = this.core.apis.GroupApi.essenceLRU.getValue(+payload.message_id);
            if(!data) throw new Error('消息不存在');
            const { msg_seq, msg_random, group_id } = JSON.parse(data) as { msg_seq: string, msg_random: string, group_id: string };
            return await this.core.apis.GroupApi.removeGroupEssenceBySeq(group_id, msg_seq, msg_random);
        }
        return await this.core.apis.GroupApi.removeGroupEssence(
            msg.Peer.peerUid,
            msg.MsgId,
        );
    }
}
