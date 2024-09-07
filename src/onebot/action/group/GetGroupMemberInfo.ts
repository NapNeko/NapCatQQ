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

    async _handle(payload: Payload) {
        const isNocache = typeof payload.no_cache === 'string' ? payload.no_cache === 'true' : !!payload.no_cache;
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error(`Uin2Uid Error ${payload.user_id}不存在`);
        const [member, info] = await Promise.allSettled([
            this.core.apis.GroupApi.getGroupMemberEx(payload.group_id.toString(), uid, isNocache),
            this.core.apis.UserApi.getUserDetailInfo(uid),
        ]);
        if (member.status !== 'fulfilled') throw new Error(`群(${payload.group_id})成员${payload.user_id}获取失败 ${member.reason}`);
        if (!member.value) throw new Error(`群(${payload.group_id})成员${payload.user_id}不存在`);
        if (info.status === 'fulfilled') {
            Object.assign(member.value, info.value);
        } else {
            this.core.context.logger.logDebug(`获取群成员详细信息失败, 只能返回基础信息 ${info.reason}`);
        }
        const date = Math.round(Date.now() / 1000);
        const retMember = OB11Entities.groupMember(payload.group_id.toString(), member.value as GroupMember);
        const Member = await this.core.apis.GroupApi.getGroupMember(payload.group_id.toString(), retMember.user_id);
        retMember.last_sent_time = parseInt(Member?.lastSpeakTime ?? date.toString());
        retMember.join_time = parseInt(Member?.joinTime ?? date.toString());
        return retMember;
    }
}

export default GetGroupMemberInfo;
