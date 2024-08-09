import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: [ 'number' , 'string' ] },
        group_name: { type: 'string' }
    },
    required: ['group_id', 'group_name']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;
export default class SetGroupName extends BaseAction<Payload, null> {
    actionName = ActionName.SetGroupName;
    PayloadSchema = SchemaData;
    protected async _handle(payload: Payload): Promise<null> {
        const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
        await NTQQGroupApi.setGroupName(payload.group_id.toString(), payload.group_name);
        return null;
    }
}
