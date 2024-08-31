import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['string', 'number'] },
        folder_name: { type: 'string' },
    },
    required: ['group_id', 'folder_name'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetGroupFileFolder extends BaseAction<Payload, any> {
    actionName = ActionName.SetGroupFileFolder;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return (await this.core.apis.GroupApi.CreatGroupFileFolder(payload.group_id.toString(), payload.folder_name)).resultWithGroupItem;
    }
}
