import { OneBotAction } from '@/onebot/action/OneBotAction';
import { NTGroupMemberRole } from '@/core/types';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.union([z.number(), z.string()]),
    user_id: z.union([z.number(), z.string()]),
    enable: z.boolean().default(false),
});

type Payload = z.infer<typeof SchemaData>;

export default class SetGroupAdmin extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupAdmin;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const enable = typeof payload.enable === 'string' ? payload.enable === 'true' : !!payload.enable;
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error('get Uid Error');
        await this.core.apis.GroupApi.setMemberRole(payload.group_id.toString(), uid, enable ? NTGroupMemberRole.KADMIN : NTGroupMemberRole.KMEMBER);
        return null;
    }
}
