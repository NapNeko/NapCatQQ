import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] }
    },
    required: ['group_id'],
} as const satisfies JSONSchema;
type Payload = FromSchema<typeof SchemaData>;

export class GoCQHTTPGetGroupAtAllRemain extends OneBotAction<Payload, any> {
    actionName = ActionName.GoCQHTTP_GetGroupAtAllRemain;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const ret = await this.core.apis.GroupApi.getGroupRemainAtTimes(payload.group_id.toString());
        const data = {
            can_at_all: ret.atInfo.canAtAll,
            remain_at_all_count_for_group: ret.atInfo.RemainAtAllCountForGroup,
            remain_at_all_count_for_uin: ret.atInfo.RemainAtAllCountForUin
        };
        return data;
    }
}
