import { NodeIKernelGroupListener } from '@/napcat-core/listeners/NodeIKernelGroupListener';
import {
  GroupExt0xEF0InfoFilter,
  GroupExtParam,
  GroupInfoSource,
  GroupMember,
  NTGroupMemberRole,
  GroupNotifyMsgType,
  NTGroupRequestOperateTypes,
  KickMemberV2Req,
  GroupDetailInfoV2Param,
  GroupExtInfo,
  GroupExtFilter,
} from '@/napcat-core/types';
import { GeneralCallResult } from '@/napcat-core/services/common';

export interface NodeIKernelGroupService {

  modifyGroupExtInfoV2 (groupExtInfo: GroupExtInfo, groupExtFilter: GroupExtFilter): Promise<GeneralCallResult &
  {
    result: {
      groupCode: string,
      result: number;
    };
  }>;

  // --->
  // 待启用 For Next Version 3.2.0
  // isTroopMember ? 0 : 111
  getGroupMemberMaxNum (groupCode: string, serviceType: number): Promise<unknown>;

  getAllGroupPrivilegeFlag (troopUinList: string[], serviceType: number): Promise<unknown>;
  // <---
  getGroupExt0xEF0Info (enableGroupCodes: string[], bannedGroupCodes: string[], filter: GroupExt0xEF0InfoFilter, forceFetch: boolean):
    Promise<GeneralCallResult & { result: { groupExtInfos: Map<string, unknown>; }; }>;

  kickMemberV2 (param: KickMemberV2Req): Promise<GeneralCallResult>;

  quitGroupV2 (param: { groupCode: string; needDeleteLocalMsg: boolean; }): Promise<GeneralCallResult>;

  getMemberCommonInfo (Req: {
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
    realSpecialTitleFlag: number;
  }): Promise<unknown>;

  getGroupMemberLevelInfo (groupCode: string): Promise<unknown>;

  getGroupInfoForJoinGroup (groupCode: string, needPrivilegeFlag: boolean, serviceType: number): Promise<unknown>;

  getGroupHonorList (req: { groupCodes: Array<string>; }): Promise<unknown>;

  getUinByUids (uins: string[]): Promise<{
    errCode: number,
    errMsg: string,
    uins: Map<string, string>;
  }>;

  getUidByUins (uins: string[]): Promise<{
    errCode: number,
    errMsg: string,
    uids: Map<string, string>;
  }>;

  checkGroupMemberCache (arrayList: Array<string>): Promise<unknown>;

  getGroupLatestEssenceList (groupCode: string): Promise<unknown>;

  shareDigest (Req: {
    appId: string,
    appType: number,
    msgStyle: number,
    recvUin: string,
    sendType: number,
    clientInfo: {
      platform: number;
    },
    richMsg: {
      usingArk: boolean,
      title: string,
      summary: string,
      url: string,
      pictureUrl: string,
      brief: string;
    };
  }): Promise<unknown>;

  isEssenceMsg (req: { groupCode: string, msgRandom: number, msgSeq: number; }): Promise<unknown>;

  queryCachedEssenceMsg (req: { groupCode: string, msgRandom: number, msgSeq: number; }): Promise<{ items: Array<unknown>; }>;

  fetchGroupEssenceList (req: {
    groupCode: string,
    pageStart: number,
    pageLimit: number;
  }, Arg: string): Promise<unknown>;

  getAllMemberList (groupCode: string, forceFetch: boolean): Promise<{
    errCode: number,
    errMsg: string,
    result: {
      ids: Array<{
        uid: string,
        index: number;// 0
      }>,
      infos: Map<string, GroupMember>,
      finish: true,
      hasRobot: false;
    };
  }>;

  setHeader (uid: string, path: string): Promise<GeneralCallResult>;

  addKernelGroupListener (listener: NodeIKernelGroupListener): number;

  removeKernelGroupListener (listenerId: number): void;

  createMemberListScene (groupCode: string, scene: string): string;

  destroyMemberListScene (SceneId: string): void;

  getNextMemberList (sceneId: string, groupMemberInfoListId: { index: number, uid: string; } | undefined, num: number): Promise<{
    errCode: number,
    errMsg: string,
    result: { ids: string[], infos: Map<string, GroupMember>, finish: boolean, hasRobot: boolean; };
  }>;

  getPrevMemberList (): unknown;

  monitorMemberList (): unknown;

  searchMember (sceneId: string, keywords: string[]): unknown;

  getMemberInfo (group_id: string, uids: string[], forceFetch: boolean): Promise<GeneralCallResult>;

  kickMember (groupCode: string, memberUids: string[], refuseForever: boolean, kickReason: string): Promise<void>;

  modifyMemberRole (groupCode: string, uid: string, role: NTGroupMemberRole): void;

  modifyMemberCardName (groupCode: string, uid: string, cardName: string): void;

  getTransferableMemberInfo (groupCode: string): unknown;// 获取整个群的

  transferGroup (uid: string): void;

  getGroupList (force: boolean): Promise<GeneralCallResult>;

  getGroupExtList (force: boolean): Promise<GeneralCallResult>;

  getGroupDetailInfo (groupCode: string, groupInfoSource: GroupInfoSource): Promise<GeneralCallResult>;

  getMemberExtInfo (param: GroupExtParam): Promise<unknown>;// req

  getGroupAllInfo (groupId: string, sourceId: number): Promise<unknown>;

  getDiscussExistInfo (): unknown;

  getGroupConfMember (): unknown;

  getGroupMsgMask (): unknown;

  getGroupPortrait (): void;

  modifyGroupName (groupCode: string, groupName: string, isNormalMember: boolean): Promise<GeneralCallResult>;

  modifyGroupRemark (groupCode: string, remark: string): Promise<GeneralCallResult>;

  modifyGroupDetailInfo (groupCode: string, arg: unknown): void;

  // 第二个参数在大多数情况为0 设置群成员权限 例如上传群文件权限和群成员付费/加入邀请加入时为8
  modifyGroupDetailInfoV2 (param: GroupDetailInfoV2Param, arg: number): Promise<GeneralCallResult>;

  setGroupMsgMask (groupCode: string, arg: unknown): void;

  changeGroupShieldSettingTemp (groupCode: string, arg: unknown): void;

  inviteToGroup (arg: unknown): void;

  inviteMembersToGroup (args: unknown[]): void;

  inviteMembersToGroupWithMsg (args: unknown): void;

  createGroup (arg: unknown): void;

  createGroupWithMembers (arg: unknown): void;

  quitGroup (groupCode: string): void;

  destroyGroup (groupCode: string): void;

  getSingleScreenNotifies (doubt: boolean, startSeq: string, count: number): Promise<GeneralCallResult>;

  clearGroupNotifies (groupCode: string): void;

  getGroupNotifiesUnreadCount (doubt: boolean): Promise<GeneralCallResult>;

  clearGroupNotifiesUnreadCount (doubt: boolean): void;

  operateSysNotify (
    doubt: boolean,
    operateMsg: {
      operateType: NTGroupRequestOperateTypes,
      targetMsg: {
        seq: string,
        type: GroupNotifyMsgType,
        groupCode: string,
        postscript: string;
      };
    }): Promise<void>;

  setTop (groupCode: string, isTop: boolean): void;

  getGroupBulletin (groupCode: string): unknown;

  deleteGroupBulletin (groupCode: string, seq: string, noticeId: string): void;

  publishGroupBulletin (groupCode: string, pskey: string, data: unknown): Promise<GeneralCallResult>;

  publishInstructionForNewcomers (groupCode: string, arg: unknown): void;

  uploadGroupBulletinPic (groupCode: string, pskey: string, imagePath: string): Promise<GeneralCallResult & {
    errCode: number;
    picInfo?: {
      id: string,
      width: number,
      height: number;
    };
  }>;

  downloadGroupBulletinRichMedia (groupCode: string): unknown;

  getGroupBulletinList (groupCode: string): unknown;

  getGroupStatisticInfo (groupCode: string): unknown;

  getGroupRemainAtTimes (groupCode: string): Promise<Omit<GeneralCallResult, 'result'> & {
    errCode: number,
    atInfo: {
      canAtAll: boolean;
      RemainAtAllCountForUin: number;
      RemainAtAllCountForGroup: number;
      atTimesMsg: string;
      canNotAtAllMsg: '';
    };
  }>;

  getJoinGroupNoVerifyFlag (groupCode: string): unknown;

  getGroupArkInviteState (groupCode: string): unknown;

  reqToJoinGroup (groupCode: string, arg: unknown): void;

  setGroupShutUp (groupCode: string, shutUp: boolean): Promise<GeneralCallResult>;

  getGroupShutUpMemberList (groupCode: string): Promise<GeneralCallResult>;

  setMemberShutUp (groupCode: string, memberTimes: { uid: string, timeStamp: number; }[]): Promise<GeneralCallResult>;

  getGroupRecommendContactArkJson (groupCode: string): Promise<GeneralCallResult & { arkJson: string; }>;

  getJoinGroupLink (param: {
    groupCode: string,
    srcId: number, // 73
    needShortUrl: boolean, // true
    additionalParam: string;// ''
  }): Promise<GeneralCallResult & { url?: string; }>;

  modifyGroupExtInfo (groupCode: string, arg: unknown): void;

  addGroupEssence (param: {
    groupCode: string;
    msgRandom: number,
    msgSeq: number;
  }): Promise<unknown>;

  removeGroupEssence (param: {
    groupCode: string;
    msgRandom: number,
    msgSeq: number;
  }): Promise<unknown>;

  isNull (): boolean;

  // --- Methods from IDA binary analysis ---
  clearGroupNotifyLocalUnreadCount (groupCode: string, arg: number): unknown;

  getCardAppList (groupCode: string, arg: boolean): unknown;

  getGroupBulletinDetail (arg1: string, arg2: string, arg3: string, arg4: boolean): unknown;

  getGroupBulletinReadUsers (arg1: string, arg2: string, arg3: string, arg4: number, arg5: number, arg6: number): unknown;

  getGroupDetailInfoByFilter (arg1: unknown, arg2: number, arg3: number, arg4: boolean): unknown;

  getGroupDetailInfoForMqq (arg1: string, arg2: number, arg3: number, arg4: boolean): unknown;

  getMemberInfoForMqq (arg1: string, arg2: Array<unknown>[], arg3: boolean): unknown;

  getMemberInfoForMqqV2 (arg1: string, arg2: Array<unknown>[], arg3: boolean, arg4: string): unknown;

  getRecGroups (arg1: string, arg2: unknown, arg3: string): unknown;

  getSingleScreenNotifiesV2 (arg1: boolean, arg2: string, arg3: number, arg4: number): unknown;

  modifyWxNotifyStatus (arg1: string, arg2: number): unknown;

  operateSpecialFocus (arg1: string, arg2: Array<unknown>[], arg3: number): unknown;

  remindGroupBulletinRead (arg1: string, arg2: string, arg3: string): unknown;

  transferGroupV2 (arg1: string, arg2: string, arg3: string): unknown;

  operateSysNotifyV2 (arg1: unknown, arg2: unknown): Promise<unknown>;

  getAllMemberListV2 (groupCode: string, arg: unknown): unknown;

  createGroupV2 (arg1: unknown, arg2: unknown): unknown;

  modifyGroupExtInfoV2 (groupExtInfo: GroupExtInfo, groupExtFilter: GroupExtFilter): Promise<GeneralCallResult & {
    result: { groupCode: string, result: number; };
  }>;

  modifyGroupDetailInfoV2 (param: GroupDetailInfoV2Param, arg: number): Promise<GeneralCallResult>;

  setGroupMsgMaskV2 (arg1: unknown, arg2: unknown): unknown;

  getGroupSquareRedpointInfo (arg1: unknown, arg2: unknown): unknown;

  getGroupSquareHomeHead (arg1: unknown, arg2: unknown): unknown;

  getCapsuleApp (arg1: unknown, arg2: unknown): unknown;

  getCapsuleAppPro (arg1: unknown, arg2: unknown): unknown;

  getMemberInfoCache (arg1: unknown, arg2: unknown): unknown;

  getGroupSecLevelInfo (arg1: unknown, arg2: unknown): unknown;

  getSubGroupInfo (arg: unknown): unknown;

  getSwitchStatusForEssenceMsg (arg: unknown): unknown;

  getTeamUpDetail (arg: unknown): unknown;

  getTeamUpList (arg: unknown): unknown;

  getTeamUpMembers (arg: unknown): unknown;

  getTeamUpTemplateList (arg: unknown): unknown;

  getTopicPage (arg1: string, arg2: string, arg3: string, arg4: string): unknown;

  getTopicRecall (arg: unknown): unknown;

  getWxNotifyStatus (arg: unknown): unknown;

  getGroupPayToJoinStatus (arg: unknown): unknown;

  getGroupSeqAndJoinTimeForGrayTips (arg: unknown): unknown;

  getGroupTagRecords (arg: unknown): unknown;

  getGroupBindGuilds (arg: unknown): unknown;

  getGroupFlagForThirdApp (arg: unknown): unknown;

  getGroupMsgLimitFreq (arg: unknown): unknown;

  getGroupMedalList (arg: unknown): unknown;

  getGroupDBVersion (arg: unknown): unknown;

  getGroupInviteNoAuthLimitNum (arg: unknown): unknown;

  getAIOBindGuildInfo (arg: unknown): unknown;

  getAppCenter (arg: unknown): unknown;

  getAICommonVoice (arg: unknown): unknown;

  groupBlacklistDelApply (arg: unknown): unknown;

  groupBlacklistGetAllApply (arg: unknown): unknown;

  fetchGroupNotify (arg: unknown): unknown;

  queryJoinGroupCanNoVerify (arg: unknown): unknown;

  halfScreenPullNotice (arg: unknown): unknown;

  halfScreenReportClick (arg: unknown): unknown;

  joinGroup (arg: unknown): unknown;

  listAllAIVoice (arg: unknown): unknown;

  miniAppGetGroupInfo (arg: unknown): unknown;

  postTeamUp (arg: unknown): unknown;

  queryAIOBindGuild (arg: unknown): unknown;

  removeGroupFromGroupList (arg: unknown): unknown;

  saveAIVoice (arg: unknown): unknown;

  setActiveExtGroup (arg: unknown): unknown;

  setAIOBindGuild (arg: unknown): unknown;

  setCapsuleSwitch (arg: unknown): unknown;

  setGroupAppList (arg: unknown): unknown;

  setGroupGeoInfo (arg: unknown): unknown;

  setGroupRelationToGuild (arg: unknown): unknown;

  setRcvJoinVerifyMsg (arg: unknown): unknown;

  teamUpCreateGroup (arg: unknown): unknown;

  teamUpInviteToGroup (arg: unknown): unknown;

  teamUpRequestToJoin (arg: unknown): unknown;

  teamUpSubmitDeadline (arg: unknown): unknown;

  topicFeedback (arg: unknown): unknown;

  topicReport (arg: unknown): unknown;

  shareTopic (arg: unknown): unknown;

  unbindAllGuilds (arg: unknown): unknown;

  updateGroupInfoByMqq (arg: unknown): unknown;

  updateMemberInfoByMqq (arg: unknown): unknown;

  updateTeamUp (arg: unknown): unknown;

  applyTeamUp (arg: unknown): unknown;

  deleteTeamUp (arg: unknown): unknown;

  getFindPageRecommendGroup (arg: unknown): unknown;

  getTransferableMemberInfo (groupCode: string): unknown;

  createGroupProfileShare (arg: unknown): unknown;

  destroyMemberListScene (sceneId: string): void;

  clearGroupSquareRedpointCache (arg: unknown): unknown;

  checkGroupMemberCache (arrayList: Array<string>): Promise<unknown>;

  cleanCapsuleCache (arg: unknown): unknown;

  downloadGroupBulletinRichMedia (groupCode: string): unknown;

  kickMemberV2 (param: KickMemberV2Req): Promise<GeneralCallResult>;

  destroyGroupV2 (arg: unknown): unknown;

  quitGroupV2 (param: { groupCode: string; needDeleteLocalMsg: boolean; }): Promise<GeneralCallResult>;

  inviteToGroupV2 (arg: unknown): unknown;

  getGroupMsgMask (): unknown;

  batchQueryCachedGroupDetailInfo (arg: unknown): unknown;

  getGroupMemberLevelInfo (groupCode: string): Promise<unknown>;

  getIllegalMemberList (arg: unknown): unknown;

  getGroupRecommendContactArkJsonToWechat (arg: unknown): unknown;
}
