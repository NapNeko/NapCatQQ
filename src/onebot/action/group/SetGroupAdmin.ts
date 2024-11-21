import { OneBotAction } from '@/onebot/action/OneBotAction';
import { NTGroupMemberRole } from '@/core/types';
import { ActionName } from '@/onebot/action/router';
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

export default class SetGroupAdmin extends OneBotAction<Payload, null> {
    actionName = ActionName.SetGroupAdmin;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const enable = typeof payload.enable === 'string' ? payload.enable === 'true' : !!payload.enable;
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error('get Uid Error');
        await this.core.apis.GroupApi.setMemberRole(payload.group_id.toString(), uid, enable ? NTGroupMemberRole.KADMIN : NTGroupMemberRole.KMEMBER);
        return null;
    }
}
