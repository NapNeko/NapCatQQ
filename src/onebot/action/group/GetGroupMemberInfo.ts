import { OB11GroupMember } from '../../types';
import { OB11Constructor } from '../../helper/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

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
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQUserApi = this.CoreContext.apis.UserApi;
        const NTQQGroupApi = this.CoreContext.apis.GroupApi;
        const NTQQWebApi = this.CoreContext.apis.WebApi;
        const isNocache = payload.no_cache == true || payload.no_cache === 'true';
        const uid = await NTQQUserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) {
            throw (`Uin2Uid Error ${payload.user_id}不存在`);
        }
        const member = await NTQQGroupApi.getGroupMemberV2(payload.group_id.toString(), uid, isNocache);
        if (!member) {
            throw (`群(${payload.group_id})成员${payload.user_id}不存在`);
        }
        try {
            const info = (await NTQQUserApi.getUserDetailInfo(member.uid));
            this.CoreContext.context.logger.logDebug('群成员详细信息结果', info);
            Object.assign(member, info);
        } catch (e) {
            this.CoreContext.context.logger.logDebug('获取群成员详细信息失败, 只能返回基础信息', e);
        }
        const date = Math.round(Date.now() / 1000);
        const retMember = OB11Constructor.groupMember(payload.group_id.toString(), member);
        if (!this.CoreContext.context.basicInfoWrapper.requireMinNTQQBuild('26702')) {
            const SelfInfoInGroup = await NTQQGroupApi.getGroupMemberV2(payload.group_id.toString(), this.CoreContext.selfInfo.uid, isNocache);
            let isPrivilege = false;
            if (SelfInfoInGroup) {
                isPrivilege = SelfInfoInGroup.role === 3 || SelfInfoInGroup.role === 4;
            }
            if (isPrivilege) {
                const webGroupMembers = await NTQQWebApi.getGroupMembers(payload.group_id.toString());
                for (let i = 0, len = webGroupMembers.length; i < len; i++) {
                    if (webGroupMembers[i]?.uin && webGroupMembers[i].uin === retMember.user_id) {
                        retMember.join_time = webGroupMembers[i]?.join_time;
                        retMember.last_sent_time = webGroupMembers[i]?.last_speak_time;
                        retMember.qage = webGroupMembers[i]?.qage;
                        retMember.level = webGroupMembers[i]?.lv.level.toString();
                    }
                }
            } else {
                const LastestMsgList = await NTQQGroupApi.getLatestMsg(payload.group_id.toString(), [payload.user_id.toString()]);
                if (LastestMsgList?.msgList?.length && LastestMsgList?.msgList?.length > 0) {
                    const last_send_time = LastestMsgList.msgList[0].msgTime;
                    if (last_send_time && last_send_time != '0' && last_send_time != '') {
                        retMember.last_sent_time = parseInt(last_send_time);
                        retMember.join_time = Math.round(Date.now() / 1000);//兜底数据 防止群管乱杀
                    }
                }
            }
        } else {
            // Mlikiowa V2.0.8 Refactor Todo
            // retMember.last_sent_time = parseInt((await getGroupMember(payload.group_id.toString(), retMember.user_id))?.lastSpeakTime || date.toString());
            // retMember.join_time = parseInt((await getGroupMember(payload.group_id.toString(), retMember.user_id))?.joinTime || date.toString());
        }
        return retMember;
    }
}

export default GetGroupMemberInfo;
