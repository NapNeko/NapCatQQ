import {
  type Friend,
  type Group,
  type GroupMember, GroupNotify,
  type SelfInfo,
  BuddyCategoryType
} from './entities';
import { isNumeric } from '@/common/utils/helper';
import { NTQQGroupApi } from '@/core/apis';

export const selfInfo: SelfInfo = {
  uid: '',
  uin: '',
  nick: '',
  online: true
};
// 未来只在此处保留 selfInfo stat
// groupCode -> Group
export const groups: Map<string, Group> = new Map<string, Group>();

export function deleteGroup(groupQQ: string) {
  groups.delete(groupQQ);
  groupMembers.delete(groupQQ);
}

// 群号 -> 群成员map(uid=>GroupMember)
export const groupMembers: Map<string, Map<string, GroupMember>> = new Map<string, Map<string, GroupMember>>();

// uid -> Friend 下面这俩个准备移除 QQ里面自带缓存
export const friends: Map<string, Friend> = new Map<string, Friend>();
export const rawFriends: Array<BuddyCategoryType> = []; // 带分组的好友列表

export const groupNotifies: Record<string, GroupNotify> = {}; // flag->GroupNotify
export async function getGroup(qq: string | number): Promise<Group | undefined> {
  let group = groups.get(qq.toString());
  if (!group) {
    try {
      const _groups = await NTQQGroupApi.getGroups();
      if (_groups.length) {
        _groups.forEach(g => {
          groups.set(g.groupCode, g);
        });
      }
    } catch (e) {
      return undefined;
    }
  }
  group = groups.get(qq.toString());
  return group;
}

export async function getGroupMember(groupQQ: string | number, memberUinOrUid: string | number) {
  groupQQ = groupQQ.toString();
  memberUinOrUid = memberUinOrUid.toString();
  let members = groupMembers.get(groupQQ);
  if (!members) {
    try {
      members = await NTQQGroupApi.getGroupMembers(groupQQ);
      // 更新群成员列表
      groupMembers.set(groupQQ, members);
    }
    catch (e) {
      return null;
    }
  }
  // log('getGroupMember', members);
  const getMember = () => {
    let member: GroupMember | undefined = undefined;
    if (isNumeric(memberUinOrUid)) {
      member = Array.from(members!.values()).find(member => member.uin === memberUinOrUid);
    } else {
      member = members!.get(memberUinOrUid);
    }
    return member;
  };
  let member = getMember();
  if (!member) {
    members = await NTQQGroupApi.getGroupMembers(groupQQ);
    member = getMember();
  }
  return member;
}
// 考虑优化 移入QQ缓存或使用Api直接获取
export const tempGroupCodeMap: Record<string, string> = {};  // peerUid => 群号

// 保留 需要频繁读写
export const stat = {
  packet_received: 0,
  packet_sent: 0,
  message_received: 0,
  message_sent: 0,
  last_message_time: 0,
  // 以下字段无用, 全部为0
  disconnect_times: 0,
  lost_times: 0,
  packet_lost: 0,
};
