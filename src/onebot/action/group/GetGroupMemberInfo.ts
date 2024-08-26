import { OB11GroupMember } from '@/onebot';
import { OB11Entities } from '@/onebot/helper/entities';
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
        const NTQQUserApi = this.core.apis.UserApi;
        const NTQQGroupApi = this.core.apis.GroupApi;
        const isNocache = typeof payload.no_cache === 'string' ? payload.no_cache === 'true' : !!payload.no_cache;
        const uid = await NTQQUserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error(`Uin2Uid Error ${payload.user_id}不存在`);
        const [member, info] = await Promise.allSettled([
            NTQQGroupApi.getGroupMemberV2(payload.group_id.toString(), uid, isNocache),
            NTQQUserApi.getUserDetailInfo(uid),
        ]);
        if (member.status !== 'fulfilled') throw new Error(`群(${payload.group_id})成员${payload.user_id}不存在 ${member.reason}`);
        if (info.status === 'fulfilled') {
            this.core.context.logger.logDebug('群成员详细信息结果', info.value);
            Object.assign(member, info.value);
        } else {
            this.core.context.logger.logDebug(`获取群成员详细信息失败, 只能返回基础信息 ${info.reason}`);
        }
        const date = Math.round(Date.now() / 1000);
        const retMember = OB11Entities.groupMember(payload.group_id.toString(), member.value as GroupMember);
        const Member = await this.core.apis.GroupApi.getGroupMember(payload.group_id.toString(), retMember.user_id);
        retMember.last_sent_time = parseInt(Member?.lastSpeakTime || date.toString());
        retMember.join_time = parseInt(Member?.joinTime || date.toString());
        return retMember;
    }
}

export default GetGroupMemberInfo;
