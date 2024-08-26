import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        category: { type: ['number', 'string'] },
        count: { type: ['number', 'string'] },
    },
    required: ['category', 'count'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetCollectionList extends BaseAction<Payload, any> {
    actionName = ActionName.GetCollectionList;
    payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const NTQQCollectionApi = this.core.apis.CollectionApi;
        return await NTQQCollectionApi.getAllCollection(parseInt(payload.category.toString()), +(payload.count ?? 1));
    }
}
