import { getGroup, getGroupMember, groupMembers, selfInfo } from '@/core/data';
import { OB11GroupMember } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { napCatCore, NTQQGroupApi, NTQQUserApi, SignMiniApp } from '@/core';
import { WebApi } from '@/core/apis/webapi';
import { logDebug } from '@/common/utils/log';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { getLastSentTimeAndJoinTime } from "../../../common/utils/LastSendAndJoinRemberLRU"
import { ob11Config } from '@/onebot11/config';

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
    const role = (await getGroupMember(payload.group_id, selfInfo.uin))?.role;

    const group = await getGroup(payload.group_id.toString());
    if (!group) {
      throw (`群${payload.group_id}不存在`);
    }

    // 从Data里面获取
    let _groupMembers: OB11GroupMember[] = OB11Constructor.groupMembers(group);
    if (payload.no_cache == true || payload.no_cache === 'true') {
      // webGroupMembers = await WebApi.getGroupMembers(payload.group_id.toString());'
      const _groupMembers = await NTQQGroupApi.getGroupMembers(payload.group_id.toString());
      groupMembers.set(group.groupCode, _groupMembers);
    }

    const MemberMap: Map<number, OB11GroupMember> = new Map<number, OB11GroupMember>();
    // 转为Map 方便索引
    for (let i = 0, len = _groupMembers.length; i < len; i++) {
      MemberMap.set(_groupMembers[i].user_id, _groupMembers[i]);
    }

    const isPrivilege = role === 3 || role === 4;
    if (isPrivilege) {
      const webGroupMembers = await WebApi.getGroupMembers(payload.group_id.toString());
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
    } else if ((ob11Config.GroupLocalTimeRecord as Array<number>).includes(payload.group_id)) {
      const _sendAndJoinRember = await getLastSentTimeAndJoinTime(payload.group_id);
      _sendAndJoinRember.forEach((element) => {
        let MemberData = MemberMap.get(element.user_id);
        if (MemberData) {
          MemberData.join_time = element.join_time;
          MemberData.last_sent_time = element.last_sent_time;
        }
      });
    }
    // 还原索引到Array 一同返回
    _groupMembers = Array.from(MemberMap.values());
    return _groupMembers;
  }
}

export default GetGroupMemberList;
