import BaseAction from '../BaseAction';
import { GroupMemberRole } from '@/core/entities';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: [ 'number' , 'string' ] },
        user_id: { type: [ 'number' , 'string' ] },
        enable: { type: 'boolean' }
    },
    required: ['group_id', 'user_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupAdmin extends BaseAction<Payload, null> {
    actionName = ActionName.SetGroupAdmin;
    PayloadSchema = SchemaData;
    protected async _handle(payload: Payload): Promise<null> {
        const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
        const NTQQUserApi = this.CoreContext.getApiContext().UserApi;
        const uid = await NTQQUserApi.getUidByUin(payload.user_id.toString());
        if(!uid) throw new Error('get Uid Error');
        await NTQQGroupApi.setMemberRole(payload.group_id.toString(), uid, payload.enable ? GroupMemberRole.admin : GroupMemberRole.normal);
        return null;
    }
}
