import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.String(),
    user_id: Type.Array(Type.String()),
    reject_add_request: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupKickMembers extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupKickMembers;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const rejectReq = payload.reject_add_request?.toString() == 'true';
        const uids: string[] = await Promise.all(payload.user_id.map(async uin => await this.core.apis.UserApi.getUidByUinV2(uin)));
        await this.core.apis.GroupApi.kickMember(payload.group_id.toString(), uids.filter(uid => !!uid), rejectReq);
        return null;
    }
}