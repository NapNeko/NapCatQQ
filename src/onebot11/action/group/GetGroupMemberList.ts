import { getGroup, groupMembers } from '@/core/data';
import { OB11GroupMember } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { napCatCore, NTQQGroupApi } from '@/core';
import { WebApi } from '@/core/apis/webapi';
import { logDebug } from '@/common/utils/log';

export interface PayloadType {
  group_id: number,
  no_cache?: boolean | string
}


class GetGroupMemberList extends BaseAction<PayloadType, OB11GroupMember[]> {
  actionName = ActionName.GetGroupMemberList;

  protected async _handle(payload: PayloadType) {
    const MemberMap: Map<number, OB11GroupMember> = new Map<number, OB11GroupMember>();
    const webGroupMembers = await WebApi.getGroupMembers(payload.group_id.toString());
    const group = await getGroup(payload.group_id.toString());
    if (!group) {
      throw (`群${payload.group_id}不存在`);
    }
    if (payload.no_cache == true || payload.no_cache === 'true') {
      // webGroupMembers = await WebApi.getGroupMembers(payload.group_id.toString());
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
    return RetGroupMember;
  }
}

export default GetGroupMemberList;
