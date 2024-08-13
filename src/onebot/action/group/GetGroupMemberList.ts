import { OB11GroupMember } from '../../types';
import { OB11Constructor } from '../../helper/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        no_cache: { type: ['boolean', 'string'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetGroupMemberList extends BaseAction<Payload, OB11GroupMember[]> {
    actionName = ActionName.GetGroupMemberList;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQGroupApi = this.CoreContext.apis.GroupApi;
        const NTQQWebApi = this.CoreContext.apis.WebApi;
        const isNocache = payload.no_cache == true || payload.no_cache === 'true';
        // const GroupList = await NTQQGroupApi.getGroups(isNocache);
        // const group = GroupList.find(item => item.groupCode == payload.group_id);
        // if (!group) {
        //     throw (`群${payload.group_id}不存在`);
        // }
        const groupMembers = await NTQQGroupApi.getGroupMembers(payload.group_id.toString());
        const groupMembersArr = Array.from(groupMembers.values());
        const groupMembersUids = groupMembersArr.map(e => e.uid);
        let _groupMembers = groupMembersArr.map(item => {
            return OB11Constructor.groupMember(payload.group_id.toString(), item);
        });

        const MemberMap: Map<number, OB11GroupMember> = new Map<number, OB11GroupMember>();
        // 转为Map 方便索引
        const GroupMemberUids: string[] = [];
        const date = Math.round(Date.now() / 1000);
        for (let i = 0, len = _groupMembers.length; i < len; i++) {
            // 保证基础数据有这个 同时避免群管插件过于依赖这个杀了
            _groupMembers[i].join_time = date;
            _groupMembers[i].last_sent_time = date;
            MemberMap.set(_groupMembers[i].user_id, _groupMembers[i]);
        }

        if (!this.CoreContext.context.basicInfoWrapper.requireMinNTQQBuild('26702')) {
            const selfRole = groupMembers.get(this.CoreContext.selfInfo.uid)?.role;
            const isPrivilege = selfRole === 3 || selfRole === 4;

            if (isPrivilege) {
                const webGroupMembers = await NTQQWebApi.getGroupMembers(payload.group_id.toString());
                for (let i = 0, len = webGroupMembers.length; i < len; i++) {
                    if (!webGroupMembers[i]?.uin) {
                        continue;
                    }
                    const MemberData = MemberMap.get(webGroupMembers[i]?.uin);
                    if (MemberData) {
                        MemberData.join_time = webGroupMembers[i]?.join_time;
                        MemberData.last_sent_time = webGroupMembers[i]?.last_speak_time;
                        MemberData.qage = webGroupMembers[i]?.qage;
                        MemberData.level = webGroupMembers[i]?.lv.level.toString();
                        MemberMap.set(webGroupMembers[i]?.uin, MemberData);
                    }
                }
            } else {
                if (isNocache) {
                    const DateMap = await NTQQGroupApi.getGroupMemberLatestSendTimeCache(payload.group_id.toString(), groupMembersUids);//开始从本地拉取
                    for (const DateUin of DateMap.keys()) {
                        const MemberData = MemberMap.get(parseInt(DateUin));
                        if (MemberData) {
                            MemberData.last_sent_time = parseInt(DateMap.get(DateUin)!);
                            //join_time 有基础数据兜底
                        }
                    }
                } else {
                    _groupMembers.forEach(item => {
                        item.last_sent_time = date;
                        item.join_time = date;
                    });
                }
            }
        } else {
            // Mlikiowa V2.0.11 Refactor Todo
            // _groupMembers.forEach(async item => {
            //   item.last_sent_time = parseInt((await getGroupMember(payload.group_id.toString(), item.user_id))?.lastSpeakTime || date.toString());
            //   item.join_time = parseInt((await getGroupMember(payload.group_id.toString(), item.user_id))?.joinTime || date.toString());
            // });
        }
        // 还原索引到Array 一同返回

        // let retData: any[] = [];
        // for (let retMem of MemberMap.values()) {
        //   retMem.level = TypeConvert.toString(retMem.level) as any;
        //   retData.push(retMem)
        // }

        // _groupMembers = Array.from(retData);

        _groupMembers = Array.from(MemberMap.values());
        return _groupMembers;
    }
}

export default GetGroupMemberList;
