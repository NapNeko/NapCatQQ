import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        model: { type: 'string' },
    }
} as const satisfies JSONSchema;
type Payload = FromSchema<typeof SchemaData>;

export class GoCQHTTPGetModelShow extends BaseAction<Payload, any> {
    actionName = ActionName.GoCQHTTP_GetModelShow;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!payload.model) {
            payload.model = 'napcat';
        }
        return [{
            variants: {
                model_show: "napcat",
                need_pay: false
            }
        }];
    }
}
