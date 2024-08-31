import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';


const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        notice_id: { type: 'string' },
    },
    required: ['group_id', 'notice_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class DelGroupNotice extends BaseAction<Payload, any> {
    actionName = ActionName.DelGroupNotice;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const group = payload.group_id.toString();
        const noticeId = payload.notice_id;
        return await this.core.apis.GroupApi.deleteGroupBulletin(group, noticeId);
    }
}
