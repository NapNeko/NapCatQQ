import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        folder_id: { type: 'string' },
    },
    required: ['group_id', 'folder_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class DelGroupFileFolder extends BaseAction<Payload, any> {
    actionName = ActionName.DelGroupFileFolder;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
        return (await NTQQGroupApi.DelGroupFileFolder(payload.group_id.toString(), payload.folder_id)).groupFileCommonResult;
    }
}
