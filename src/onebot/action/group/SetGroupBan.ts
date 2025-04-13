import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.union([z.number(), z.string()]),
    user_id: z.union([z.number(), z.string()]),
    duration: z.union([z.number(), z.string()]).default(0),
});

type Payload = z.infer<typeof SchemaData>;

export default class SetGroupBan extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupBan;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload): Promise<null> {
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error('uid error');
        let member_role = (await this.core.apis.GroupApi.getGroupMemberEx(payload.group_id.toString(), uid, true))?.role;
        if (member_role === 4) throw new Error('cannot ban owner');
        // 例如无管理员权限时 result为 120101005 errMsg为 'ERR_NOT_GROUP_ADMIN'
        let ret = await this.core.apis.GroupApi.banMember(payload.group_id.toString(),
            [{ uid: uid, timeStamp: +payload.duration }]);
        if (ret.result !== 0) throw new Error(ret.errMsg);
        return null;
    }
}
