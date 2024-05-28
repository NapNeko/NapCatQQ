import { getGroup, groupMembers } from '@/core/data';
import { OB11GroupMember } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { napCatCore, NTQQGroupApi, NTQQUserApi, SignMiniApp } from '@/core';
import { WebApi } from '@/core/apis/webapi';
import { logDebug } from '@/common/utils/log';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { getLastSentTimeAndJoinTime }from "./LastSendAndJoinRemberLRU"

const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: 'number' },
    no_cache: { type: ['boolean', 'string'] },
  },
  required: ['group_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetGroupMemberList extends BaseAction<Payload, OB11GroupMember[]> {
  actionName = ActionName.GetGroupMemberList;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    const MemberMap: Map<number, OB11GroupMember> = new Map<number, OB11GroupMember>();
    const webGroupMembers = await WebApi.getGroupMembers(payload.group_id.toString());
    const group = await getGroup(payload.group_id.toString());
    if (!group) {
      throw (`群${payload.group_id}不存在`);
    }
    if (payload.no_cache == true || payload.no_cache === 'true') {
      // webGroupMembers = await WebApi.getGroupMembers(payload.group_id.toString());'
      const _groupMembers = await NTQQGroupApi.getGroupMembers(payload.group_id.toString());
      groupMembers.set(group.groupCode, _groupMembers);
    }
    const _groupMembers = OB11Constructor.groupMembers(group);

    // 方便索引处理
    for (let i = 0, len = _groupMembers.length; i < len; i++) {

      MemberMap.set(_groupMembers[i].user_id, _groupMembers[i]);
    }
    // 合并数据
    for (let i = 0, len = webGroupMembers.length; i < len; i++) {
      if (!webGroupMembers[i]?.uin) {
        continue;
      }
      const MemberData = MemberMap.get(webGroupMembers[i]?.uin);
      if (MemberData) {
        MemberData.join_time = webGroupMembers[i]?.join_time;
        MemberData.last_sent_time = webGroupMembers[i]?.last_speak_time;
        MemberData.qage = webGroupMembers[i]?.qage;
        MemberData.level = webGroupMembers[i]?.lv.level;
        MemberMap.set(webGroupMembers[i]?.uin, MemberData);
      }
    }
    // 还原Map到Array
    const RetGroupMember: OB11GroupMember[] = Array.from(MemberMap.values());

     // 无管理员权限通过本地记录获取发言时间
    const haveAdmin = RetGroupMember[0].last_sent_time !== 0;
    if (!haveAdmin) {
      //logDebug('没有管理员权限，使用本地记录');
      const _sendAndJoinRember = await getLastSentTimeAndJoinTime(parseInt(group.groupCode));
      _sendAndJoinRember.forEach((rember) => {
        const member = RetGroupMember.find(member=>member.user_id == rember.user_id);
        if(member){
          member.last_sent_time = rember.last_sent_time;
          member.join_time = rember.join_time;
        }
      })
    }
    
    return RetGroupMember;
  }
}

export default GetGroupMemberList;
