import { getGroup, getGroupMember, groupMembers, selfInfo } from '@/core/data';
import { OB11GroupMember } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core';
import { WebApi } from '@/core/apis/webapi';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: ['number', 'string'] },
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
    let date = Math.round(Date.now() / 1000);
    for (let i = 0, len = _groupMembers.length; i < len; i++) {
      // 保证基础数据有这个 同时避免群管插件过于依赖这个杀了
      _groupMembers[i].join_time = date;
      _groupMembers[i].last_sent_time = date;
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
          MemberData.level = webGroupMembers[i]?.lv.level.toString();
          MemberMap.set(webGroupMembers[i]?.uin, MemberData);
        }
      }
    } else {
      const DateMap = await NTQQGroupApi.getGroupMemberLastestSendTimeCache(payload.group_id.toString());//开始从本地拉取
      for (let DateUin of DateMap.keys()) {
        const MemberData = MemberMap.get(parseInt(DateUin));
        if (MemberData) {
          MemberData.last_sent_time = parseInt(DateMap.get(DateUin)!);
          //join_time 有基础数据兜底
        }
      }
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
