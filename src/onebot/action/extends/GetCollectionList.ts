import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        category: { type: 'number' },
        count: { type: 'number' },
    },
    required: ['category', 'count'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetCollectionList extends BaseAction<Payload, any> {
    actionName = ActionName.GetCollectionList;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQCollectionApi = this.CoreContext.getApiContext().CollectionApi;
        return await NTQQCollectionApi.getAllCollection(payload.category, payload.count);
    }
}
