import { OB11Group } from '@/onebot';
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

export class GetGroupShutList extends BaseAction<Payload, OB11Group> {
    actionName = ActionName.GetGroupShutList;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.GroupApi.getGroupShutUpMemberList(payload.group_id.toString());
    }
}

