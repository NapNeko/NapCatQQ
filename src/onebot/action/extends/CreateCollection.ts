import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        rawData: { type: 'string' },
        brief: { type: 'string' },
    },
    required: ['brief', 'rawData'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class CreateCollection extends BaseAction<Payload, any> {
    actionName = ActionName.CreateCollection;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.CollectionApi.createCollection(
            this.core.selfInfo.uin,
            this.core.selfInfo.uid,
            this.core.selfInfo.nick,
            payload.brief, payload.rawData,
        );
    }
}
