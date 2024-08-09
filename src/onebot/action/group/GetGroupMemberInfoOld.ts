import { OB11GroupMember } from '../../types';
import { OB11Constructor } from '../../helper/constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis/user';
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
    const NTQQUserApi = this.CoreContext.getApiContext().UserApi;
    const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
    if (this.CoreContext.context.basicInfoWrapper.requireMinNTQQBuild('26702')) {
      const V2Data = await NTQQGroupApi.getGroupMemberV2(payload.group_id.toString(), payload.user_id.toString(), payload.no_cache == true || payload.no_cache === 'true');
      if (V2Data) {
        return OB11Constructor.groupMember(payload.group_id.toString(), V2Data);
      } else {
        throw (`群(${payload.group_id})成员${payload.user_id}不存在`);
      }
    }
    const group = await getGroup(payload.group_id.toString());
    const role = (await getGroupMember(payload.group_id, selfInfo.uin))?.role;
    const isPrivilege = role === 3 || role === 4;
    if (!group) {
      throw (`群(${payload.group_id})不存在`);
    }
    if (payload.no_cache == true || payload.no_cache === 'true') {
      groupMembers.set(group.groupCode, await NTQQGroupApi.getGroupMembers(payload.group_id.toString()));
    }
    const member = await getGroupMember(payload.group_id.toString(), payload.user_id.toString());
    //早返回
    if (!member) {
      throw (`群(${payload.group_id})成员${payload.user_id}不存在`);
    }
    //console.log('GetGroupMemberInfo', JSON.stringify(await NTQQGroupApi.getGroupMemberV2(payload.group_id.toString(), member.uid, true), null, 4));
    try {
      const info = (await NTQQUserApi.getUserDetailInfo(member.uid));
      logDebug('群成员详细信息结果', info);
      Object.assign(member, info);
    } catch (e) {
      logDebug('获取群成员详细信息失败, 只能返回基础信息', e);
    }
    const retMember = OB11Constructor.groupMember(payload.group_id.toString(), member);
    if (isPrivilege) {
      const webGroupMembers = await WebApi.getGroupMembers(payload.group_id.toString());
      for (let i = 0, len = webGroupMembers.length; i < len; i++) {
        if (webGroupMembers[i]?.uin && webGroupMembers[i].uin === retMember.user_id) {
          retMember.join_time = webGroupMembers[i]?.join_time;
          retMember.last_sent_time = webGroupMembers[i]?.last_speak_time;
          retMember.qage = webGroupMembers[i]?.qage;
          retMember.level = webGroupMembers[i]?.lv.level.toString();
        }
      }
    } else {
      const LastestMsgList = await NTQQGroupApi.getLastestMsg(payload.group_id.toString(), [payload.user_id.toString()]);
      if (LastestMsgList?.msgList?.length && LastestMsgList?.msgList?.length > 0) {
        const last_send_time = LastestMsgList.msgList[0].msgTime;
        if (last_send_time && last_send_time != '0' && last_send_time != '') {
          retMember.last_sent_time = parseInt(last_send_time);
          retMember.join_time = Math.round(Date.now() / 1000);//兜底数据 防止群管乱杀
        }
      }
    }
    return retMember;
  }
}
export default GetGroupMemberInfo;