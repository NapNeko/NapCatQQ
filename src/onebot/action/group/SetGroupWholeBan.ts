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
    PayloadSchema = SchemaData;

    protected async _handle(payload: Payload): Promise<null> {
        const enable = payload.enable?.toString() !== 'false';
        const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
        await NTQQGroupApi.banGroup(payload.group_id.toString(), enable);
        return null;
    }
}
