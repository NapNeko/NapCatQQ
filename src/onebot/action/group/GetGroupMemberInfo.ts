import { OB11GroupMember } from '@/onebot';
import { OB11Entities } from '@/onebot/entities';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { GroupMember } from '@/core';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        user_id: { type: ['number', 'string'] },
        no_cache: { type: ['boolean', 'string'] },
    },
    required: ['group_id', 'user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetGroupMemberInfo extends BaseAction<Payload, OB11GroupMember> {
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
        return OB11Entities.groupMember(payload.group_id.toString(), member as GroupMember);
    }
}

export default GetGroupMemberInfo;