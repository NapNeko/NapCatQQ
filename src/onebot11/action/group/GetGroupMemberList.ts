import { getGroup } from '@/core/data';
import { OB11GroupMember } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { napCatCore, NTQQGroupApi } from '@/core';
import { WebApi } from '@/core/apis/webapi';
import { logDebug } from '@/common/utils/log';

export interface PayloadType {
  group_id: number
}


class GetGroupMemberList extends BaseAction<PayloadType, OB11GroupMember[]> {
  actionName = ActionName.GetGroupMemberList;

  protected async _handle(payload: PayloadType) {
    let MemberMap: Map<number, OB11GroupMember> = new Map<number, OB11GroupMember>();
    let WebGroupMember = await WebApi.getGroupMembers(payload.group_id.toString());
    // await NTQQGroupApi.getGroupMembers(payload.group_id.toString());
    const group = await getGroup(payload.group_id.toString());
    if (!group) {
      throw (`群${payload.group_id}不存在`);
    }
    let GroupMember = OB11Constructor.groupMembers(group);
    // 方便索引处理
    for (let i = 0, len = GroupMember.length; i < len; i++) {
      MemberMap.set(GroupMember[i].user_id, GroupMember[i]);
    }
    // 合并数据
    for (let i = 0, len = WebGroupMember.length; i < len; i++) {
      if (!WebGroupMember[i]?.uin) {
        continue;
      }
      let MemberData = MemberMap.get(WebGroupMember[i]?.uin);
      if (MemberData) {
        MemberData.join_time = WebGroupMember[i]?.join_time;
        MemberData.last_sent_time = WebGroupMember[i]?.last_speak_time;
        MemberData.qage = WebGroupMember[i]?.qage;
        MemberData.level = WebGroupMember[i]?.lv.level;
        MemberMap.set(WebGroupMember[i]?.uin, MemberData);
      }
    }
    // 还原Map到Array
    let RetGroupMember: OB11GroupMember[] = Array.from(MemberMap.values());
    return RetGroupMember;
  }
}

export default GetGroupMemberList;
