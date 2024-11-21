import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
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

export class GetCollectionList extends OneBotAction<Payload, any> {
    actionName = ActionName.GetCollectionList;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.CollectionApi.getAllCollection(parseInt(payload.category.toString()), +(payload.count ?? 1));
    }
}
