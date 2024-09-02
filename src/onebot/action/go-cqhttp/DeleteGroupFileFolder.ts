import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { ActionName } from '../types';
import BaseAction from '../BaseAction';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        folder_id: { type: 'string' },
    },
    required: ['group_id', 'folder_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class DeleteGroupFileFolder extends BaseAction<Payload, any>  {
    actionName = ActionName.GoCQHTTP_DeleteGroupFileFolder;
    payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        return (await this.core.apis.GroupApi.DelGroupFileFolder(
            payload.group_id.toString(), payload.folder_id)).groupFileCommonResult;
    }
}
