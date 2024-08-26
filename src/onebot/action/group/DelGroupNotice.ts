import { WebApiGroupNoticeFeed } from '@/core';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';


const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        feed_id: { type: 'string' },
    },
    required: ['group_id','feed_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class DelGroupNotice extends BaseAction<Payload, any> {
    actionName = ActionName.DelGroupNotice;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQGroupApi = this.core.apis.GroupApi;
        const group = payload.group_id.toString();
        const feedId = payload.feed_id;
        return await NTQQGroupApi.deleteGroupBulletin(group, feedId);
    }
}
