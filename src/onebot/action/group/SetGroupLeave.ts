import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: [ 'number' , 'string' ] },
        is_dismiss: { type: 'boolean' }
    },
    required: ['group_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;
export default class SetGroupLeave extends BaseAction<Payload, any> {
    actionName = ActionName.SetGroupLeave;
    PayloadSchema = SchemaData;
    protected async _handle(payload: Payload): Promise<any> {
        const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
        await NTQQGroupApi.quitGroup(payload.group_id.toString());
    }
}
