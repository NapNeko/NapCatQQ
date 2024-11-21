import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        longNick: { type: 'string' },
    },
    required: ['longNick'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetLongNick extends OneBotAction<Payload, any> {
    actionName = ActionName.SetLongNick;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.UserApi.setLongNick(payload.longNick);
    }
}
