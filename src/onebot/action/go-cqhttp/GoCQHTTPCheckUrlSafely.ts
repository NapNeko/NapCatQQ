import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        url: { type: 'string' },
    },
    required: ['url'],
} as const satisfies JSONSchema;
type Payload = FromSchema<typeof SchemaData>;

export class GoCQHTTPCheckUrlSafely extends BaseAction<Payload, any> {
    actionName = ActionName.GoCQHTTP_CheckUrlSafely;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return { level: 1 };
    }
}
