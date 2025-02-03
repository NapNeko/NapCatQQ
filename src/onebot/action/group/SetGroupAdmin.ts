import { OneBotAction } from '@/onebot/action/OneBotAction';
import { NTGroupMemberRole } from '@/core/types';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    user_id: Type.Union([Type.Number(), Type.String()]),
    enable: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
});

type Payload = Static<typeof SchemaData>;

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
