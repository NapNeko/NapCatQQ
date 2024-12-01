import { OB11GroupMember } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    user_id: Type.Union([Type.Number(), Type.String()]),
    no_cache: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
});

type Payload = Static<typeof SchemaData>;

class GetGroupMemberInfo extends OneBotAction<Payload, OB11GroupMember> {
    actionName = ActionName.GetGroupMemberInfo;
    payloadSchema = SchemaData;

    private parseBoolean(value: boolean | string): boolean {
        return typeof value === 'string' ? value === 'true' : value;
    }

    private async getUid(userId: string | number): Promise<string> {
        const uid = await this.core.apis.UserApi.getUidByUinV2(userId.toString());
        if (!uid) throw new Error(`Uin2Uid Error: 用户ID ${userId} 不存在`);
        return uid;
    }

    async _handle(payload: Payload) {
        const isNocache = this.parseBoolean(payload.no_cache ?? true);
        const uid = await this.getUid(payload.user_id);
        const [member, info] = await Promise.all([
            this.core.apis.GroupApi.getGroupMemberEx(payload.group_id.toString(), uid, isNocache),
            this.core.apis.UserApi.getUserDetailInfo(uid),
        ]);
        if (!member) throw new Error(`群(${payload.group_id})成员${payload.user_id}不存在`);
        if (info) {
            Object.assign(member, info);
        } else {
            this.core.context.logger.logDebug(`获取群成员详细信息失败, 只能返回基础信息`);
        }
        return OB11Construct.groupMember(payload.group_id.toString(), member);
    }
}

export default GetGroupMemberInfo;