import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupFileCount extends BaseAction<Payload, { count: number }> {
    actionName = ActionName.GetGroupFileCount;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQGroupApi = this.core.apis.GroupApi;
        const ret = await NTQQGroupApi.GetGroupFileCount([payload.group_id?.toString()]);
        return { count: ret.groupFileCounts[0] };
    }
}
