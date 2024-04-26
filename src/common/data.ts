import {
  type Friend,
  type FriendRequest,
  type Group,
  type GroupMember, GroupNotify,
  type SelfInfo
} from '../core/src/entities';
import { isNumeric } from './utils/helper';
import { log } from '@/common/utils/log';

export const selfInfo: SelfInfo = {
  uid: '',
  uin: '',
  nick: '',
  online: true
};

// groupCode -> Group
export const groups: Map<string, Group> = new Map<string, Group>();

export function deleteGroup(groupQQ: string) {
  groups.delete(groupQQ);
  groupMembers.delete(groupQQ);
}

// 群号 -> 群成员map(uid=>GroupMember)
export const groupMembers: Map<string, Map<string, GroupMember>> = new Map<string, Map<string, GroupMember>>();

// uid -> Friend
export const friends: Map<string, Friend> = new Map<string, Friend>();

export const friendRequests: Record<string, FriendRequest> = {}; // flag->FriendRequest
export const groupNotifies: Record<string, GroupNotify> = {}; // flag->GroupNotify

export const napCatError = {
  ffmpegError: '',
  httpServerError: '',
  wsServerError: '',
  otherError: 'NapCat未能正常启动，请检查日志查看错误'
};

export async function getFriend(uinOrUid: string): Promise<Friend | undefined> {
  uinOrUid = uinOrUid.toString();
  if (isNumeric(uinOrUid)) {
    const friendList = Array.from(friends.values());
    return friendList.find(friend => friend.uin === uinOrUid);
  } else {
    return friends.get(uinOrUid);
  }
}

export async function getGroup(qq: string): Promise<Group | undefined> {
  const group = groups.get(qq.toString());
  return group;
}

export async function getGroupMember(groupQQ: string | number, memberUinOrUid: string | number) {
  groupQQ = groupQQ.toString();
  memberUinOrUid = memberUinOrUid.toString();
  const members = groupMembers.get(groupQQ);
  if (!members) {
    return null;
  }
  // log('getGroupMember', members);
  if (isNumeric(memberUinOrUid)) {
    return Array.from(members.values()).find(member => member.uin === memberUinOrUid);
  } else {
    return members.get(memberUinOrUid);
  }
}

export async function refreshGroupMembers(groupQQ: string) {
  // const group = groups.find(group => group.groupCode === groupQQ)
  // if (group) {
  //     group.members = await NTQQGroupApi.getGroupMembers(groupQQ)
  // }
}

export const uid2UinMap: Record<string, string> = {}; // 一串加密的字符串(uid) -> qq号

export function getUidByUin(uin: string) {
  for (const uid in uid2UinMap) {
    if (uid2UinMap[uid] === uin) {
      return uid;
    }
  }
}

export const tempGroupCodeMap: Record<string, string> = {};  // peerUid => 群号

