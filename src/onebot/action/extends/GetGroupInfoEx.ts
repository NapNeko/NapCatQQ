import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupInfoEx extends BaseAction<Payload, any> {
    actionName = ActionName.GetGroupInfoEx;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return (await this.core.apis.GroupApi.getGroupExtFE0Info([payload.group_id.toString()])).result.groupExtInfos.get(payload.group_id.toString());
    }
}
