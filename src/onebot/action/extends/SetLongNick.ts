import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        longNick: { type: 'string' },
    },
    required: ['longNick'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetLongNick extends BaseAction<Payload, any> {
    actionName = ActionName.SetLongNick;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.UserApi.setLongNick(payload.longNick);
    }
}
