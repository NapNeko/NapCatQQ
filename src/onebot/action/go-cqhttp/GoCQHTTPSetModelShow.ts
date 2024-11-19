import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {},
} as const satisfies JSONSchema;
type Payload = FromSchema<typeof SchemaData>;

//兼容性代码
export class GoCQHTTPSetModelShow extends OneBotAction<Payload, any> {
    actionName = ActionName.GoCQHTTP_SetModelShow;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return null;
    }
}
