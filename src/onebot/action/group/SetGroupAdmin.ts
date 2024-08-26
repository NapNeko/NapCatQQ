import BaseAction from '../BaseAction';
import { GroupMemberRole } from '@/core/entities';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        user_id: { type: ['number', 'string'] },
        enable: { type: ['boolean', 'string'] },
    },
    required: ['group_id', 'user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupAdmin extends BaseAction<Payload, null> {
    actionName = ActionName.SetGroupAdmin;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const enable = typeof payload.enable === 'string' ? payload.enable === 'true' : !!payload.enable;
        const NTQQGroupApi = this.core.apis.GroupApi;
        const NTQQUserApi = this.core.apis.UserApi;
        const uid = await NTQQUserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error('get Uid Error');
        await NTQQGroupApi.setMemberRole(payload.group_id.toString(), uid, enable ? GroupMemberRole.admin : GroupMemberRole.normal);
        return null;
    }
}
