import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        file_id: { type: 'string' },
    },
    required: ['group_id', 'file_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class DelGroupFile extends BaseAction<Payload, any> {
    actionName = ActionName.DelGroupFile;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQGroupApi = this.core.apis.GroupApi;
        return await NTQQGroupApi.DelGroupFile(payload.group_id.toString(), [payload.file_id]);
    }
}
