import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        enable: { type: ['boolean', 'string'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupWholeBan extends BaseAction<Payload, null> {
    actionName = ActionName.SetGroupWholeBan;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const enable = payload.enable?.toString() !== 'false';
        await this.core.apis.GroupApi.banGroup(payload.group_id.toString(), enable);
        return null;
    }
}
