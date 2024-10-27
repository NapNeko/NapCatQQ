import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] }
    },
    required: ['group_id'],
} as const satisfies JSONSchema;
type Payload = FromSchema<typeof SchemaData>;

export class GoCQHTTPGetGroupAtAllRemain extends BaseAction<Payload, any> {
    actionName = ActionName.GoCQHTTP_GetGroupAtAllRemain;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const ret = await this.core.apis.GroupApi.getGroupRemainAtTimes(payload.group_id.toString());
        if (!ret.atInfo || ret.result !== 0) {
            throw new Error('atInfo not found');
        }
        const data = {
            can_at_all: ret.atInfo.canAtAll,
            remain_at_all_count_for_group: ret.atInfo.RemainAtAllCountForGroup,
            remain_at_all_count_for_uin: ret.atInfo.RemainAtAllCountForUin
        };
        return data;
    }
}
