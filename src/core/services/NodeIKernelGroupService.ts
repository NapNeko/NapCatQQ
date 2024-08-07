import { NodeIKernelGroupListener } from '@/core/listeners/NodeIKernelGroupListener';
import {
  GroupExtParam,
  GroupMember,
  GroupMemberRole,
  GroupNotifyTypes,
  GroupRequestOperateTypes,
} from '@/core/entities';
import { GeneralCallResult } from '@/core/services/common';

//高版本的接口不应该随意使用 使用应该严格进行pr审核 同时部分ipc中未出现的接口不要过于依赖 应该做好数据兜底

export interface NodeIKernelGroupService {
  getMemberCommonInfo(Req: {
    groupCode: string,
    startUin: string,
    identifyFlag: string,
    uinList: string[],
    memberCommonFilter: {
      memberUin: number,
      uinFlag: number,
      uinFlagExt: number,
      uinMobileFlag: number,
      shutUpTime: number,
      privilege: number,
    },
    memberNum: number,
    filterMethod: string,
    onlineFlag: string,
    realSpecialTitleFlag: number
  }): Promise<unknown>;
  //26702
  getGroupMemberLevelInfo(groupCode: string): Promise<unknown>;
  //26702
  getGroupHonorList(groupCodes: Array<string>): unknown;

  getUinByUids(uins: string[]): Promise<{
    errCode: number,
    errMsg: string,
    uins: Map<string, string>
  }>;
  
  getUidByUins(uins: string[]): Promise<{
    errCode: number,
    errMsg: string,
    uids: Map<string, string>
  }>;
  //26702(其实更早 但是我不知道)
  checkGroupMemberCache(arrayList: Array<string>): Promise<unknown>;

  //26702(其实更早 但是我不知道)
  getGroupLatestEssenceList(groupCode: string): Promise<unknown>;

  //26702(其实更早 但是我不知道) 
  shareDigest(Req: {
    appId: string,
    appType: number,
    msgStyle: number,
    recvUin: string,
    sendType: number,
    clientInfo: {
      platform: number
    },
    richMsg: {
      usingArk: boolean,
      title: string,
      summary: string,
      url: string,
      pictureUrl: string,
      brief: string
    }
  }): Promise<unknown>;
  //26702(其实更早 但是我不知道)
  isEssenceMsg(Req: { groupCode: string, msgRandom: number, msgSeq: number }): Promise<unknown>;
  //26702(其实更早 但是我不知道)
  queryCachedEssenceMsg(Req: { groupCode: string, msgRandom: number, msgSeq: number }): Promise<unknown>;
  //26702(其实更早 但是我不知道)
  fetchGroupEssenceList(Req: { groupCode: string, pageStart: number, pageLimit: number }, Arg: unknown): Promise<unknown>;
  //26702
  getAllMemberList(groupCode: string, forceFetch: boolean): Promise<{
    errCode: number,
    errMsg: string,
    result: {
      ids: Array<{
        uid: string,
        index: number//0
      }>,
      infos: {},
      finish: true,
      hasRobot: false
    }
  }>;

  setHeader(uid: string, path: string): unknown;

  addKernelGroupListener(listener: NodeIKernelGroupListener): number;

  removeKernelGroupListener(listenerId: unknown): void;

  createMemberListScene(groupCode: string, scene: string): string;

  destroyMemberListScene(SceneId:string): void;
  //About Arg (a) name: lastId 根据手Q来看为object {index:?(number),uid:string}
  getNextMemberList(sceneId: string, a: undefined, num: number): Promise<{
    errCode: number, errMsg: string,
    result: { ids: string[], infos: Map<string, GroupMember>, finish: boolean, hasRobot: boolean }
  }>;

  getPrevMemberList(): unknown;

  monitorMemberList(): unknown;

  searchMember(sceneId: string, keywords: string[]): unknown;

  getMemberInfo(group_id: string, uids: string[], forceFetch: boolean): Promise<GeneralCallResult>;
  //getMemberInfo  [ '56729xxxx', [ 'u_4Nj08cwW5Hxxxxx' ], true ]

  kickMember(groupCode: string, memberUids: string[], refuseForever: boolean, kickReason: string): Promise<void>;

  modifyMemberRole(groupCode: string, uid: string, role: GroupMemberRole): void;

  modifyMemberCardName(groupCode: string, uid: string, cardName: string): void;

  getTransferableMemberInfo(groupCode: string): unknown;//获取整个群的

  transferGroup(uid: string): void;

  getGroupList(force: boolean): Promise<GeneralCallResult>;

  getGroupExtList(force: boolean): Promise<GeneralCallResult>;

  getGroupDetailInfo(groupCode: string): unknown;

  getMemberExtInfo(param: GroupExtParam): Promise<unknown>;//req

  getGroupAllInfo(): unknown;

  getDiscussExistInfo(): unknown;

  getGroupConfMember(): unknown;

  getGroupMsgMask(): unknown;

  getGroupPortrait(): void;

  modifyGroupName(groupCode: string, groupName: string, arg: false): void;

  modifyGroupRemark(groupCode: string, remark: string): void;

  modifyGroupDetailInfo(groupCode: string, arg: unknown): void;

  setGroupMsgMask(groupCode: string, arg: unknown): void;

  changeGroupShieldSettingTemp(groupCode: string, arg: unknown): void;

  inviteToGroup(arg: unknown): void;

  inviteMembersToGroup(args: unknown[]): void;

  inviteMembersToGroupWithMsg(args: unknown): void;

  createGroup(arg: unknown): void;

  createGroupWithMembers(arg: unknown): void;

  quitGroup(groupCode: string): void;

  destroyGroup(groupCode: string): void;
  //获取单屏群通知列表
  getSingleScreenNotifies(force: boolean, start_seq: string, num: number): Promise<GeneralCallResult>;

  clearGroupNotifies(groupCode: string): void;

  getGroupNotifiesUnreadCount(unknown: Boolean): Promise<GeneralCallResult>;

  clearGroupNotifiesUnreadCount(groupCode: string): void;

  operateSysNotify(
    doubt: boolean,
    operateMsg: {
      operateType: GroupRequestOperateTypes, // 2 拒绝
      targetMsg: {
        seq: string,  // 通知序列号
        type: GroupNotifyTypes,
        groupCode: string,
        postscript: string
      }
    }): Promise<void>;

  setTop(groupCode: string, isTop: boolean): void;

  getGroupBulletin(groupCode: string): unknown;

  deleteGroupBulletin(groupCode: string, seq: string): void;

  publishGroupBulletin(groupCode: string, pskey: string, data: any): Promise<GeneralCallResult>;

  publishInstructionForNewcomers(groupCode: string, arg: unknown): void;

  uploadGroupBulletinPic(groupCode: string, pskey: string, imagePath: string): Promise<GeneralCallResult & {
    errCode: number;
    picInfo?: {
      id: string,
      width: number,
      height: number
    }
  }>;

  downloadGroupBulletinRichMedia(groupCode: string): unknown;

  getGroupBulletinList(groupCode: string): unknown;

  getGroupStatisticInfo(groupCode: string): unknown;

  getGroupRemainAtTimes(groupCode: string): number;

  getJoinGroupNoVerifyFlag(groupCode: string): unknown;

  getGroupArkInviteState(groupCode: string): unknown;

  reqToJoinGroup(groupCode: string, arg: unknown): void;

  setGroupShutUp(groupCode: string, shutUp: boolean): void;

  getGroupShutUpMemberList(groupCode: string): unknown[];

  setMemberShutUp(groupCode: string, memberTimes: { uid: string, timeStamp: number }[]): Promise<void>;

  getGroupRecommendContactArkJson(groupCode: string): unknown;

  getJoinGroupLink(groupCode: string): unknown;

  modifyGroupExtInfo(groupCode: string, arg: unknown): void;

  //需要提前判断是否存在 高版本新增
  addGroupEssence(param: {
    groupCode: string
    msgRandom: number,
    msgSeq: number
  }): Promise<unknown>;
  //需要提前判断是否存在 高版本新增
  removeGroupEssence(param: {
    groupCode: string
    msgRandom: number,
    msgSeq: number
  }): Promise<unknown>;

  isNull(): boolean;
}
