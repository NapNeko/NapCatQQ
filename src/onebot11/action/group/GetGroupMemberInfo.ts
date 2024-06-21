import { OB11GroupMember } from '../../types';
import { getGroupMember, groupMembers } from '@/core/data';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis/user';
import { log, logDebug } from '@/common/utils/log';
import { isNull } from '../../../common/utils/helper';
import { WebApi } from '@/core/apis/webapi';
import { NTQQGroupApi } from '@/core';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

// no_cache get时传字符串
const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: ['number', 'string'] },
    user_id: { type: ['number', 'string'] },
    no_cache: { type: ['boolean', 'string'] },
  },
  required: ['group_id', 'user_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetGroupMemberInfo extends BaseAction<Payload, OB11GroupMember> {
  actionName = ActionName.GetGroupMemberInfo;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    const group =  (await NTQQGroupApi.getGroups()).find(e => e.groupCode == payload.group_id?.toString());
    if (!group) {
      throw (`群(${payload.group_id})不存在`);
    }
    const webGroupMembers = await WebApi.getGroupMembers(payload.group_id.toString());
    if (payload.no_cache == true || payload.no_cache === 'true') {
      groupMembers.set(group.groupCode, await NTQQGroupApi.getGroupMembers(payload.group_id.toString()));
    }
    const member = await getGroupMember(payload.group_id.toString(), payload.user_id.toString());
    // log(member);
    if (member) {
      logDebug('获取群成员详细信息');
      try {
        const info = (await NTQQUserApi.getUserDetailInfo(member.uid));
        logDebug('群成员详细信息结果', info);
        Object.assign(member, info);
      } catch (e) {
        logDebug('获取群成员详细信息失败, 只能返回基础信息', e);
      }
      const retMember = OB11Constructor.groupMember(payload.group_id.toString(), member);
      for (let i = 0, len = webGroupMembers.length; i < len; i++) {
        if (webGroupMembers[i]?.uin && webGroupMembers[i].uin === retMember.user_id) {
          retMember.join_time = webGroupMembers[i]?.join_time;
          retMember.last_sent_time = webGroupMembers[i]?.last_speak_time;
          retMember.qage = webGroupMembers[i]?.qage;
          retMember.level = webGroupMembers[i]?.lv.level.toString();
        }
      }
      return retMember;
    } else {
      throw (`群(${payload.group_id})成员${payload.user_id}不存在`);
    }
  }
}

export default GetGroupMemberInfo;
