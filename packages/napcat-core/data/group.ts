import { GroupDetailInfoV2Param, GroupExtInfo, GroupExtFilter, GroupManagementSettings } from '../types';

const MEMBER_INVITE_PRIVILEGE_MASK = 0x06100000;
const MEMBER_UPLOAD_ALBUM_PRIVILEGE_MASK = 0x1;
const MEMBER_CREATE_GROUP_FLAG = 0x8000;
const MEMBER_TEMPORARY_SESSION_FLAG = 0x10000;
const NEW_MEMBER_RECENT_HISTORY_FLAG = 0x4;

function mergeMaskedFlag (currentFlag: number, requestedFlag: number, maskValue: number): number {
  const mask = BigInt(maskValue);
  return Number((BigInt(currentFlag) & ~mask) | (BigInt(requestedFlag) & mask));
}

export function applyGroupManagementSettings (
  param: GroupDetailInfoV2Param,
  settings: GroupManagementSettings
): boolean {
  let changed = false;

  if (settings.memberInvite !== undefined) {
    const privilegeByPolicy = {
      disabled: 0x04000000,
      require_approval: 0,
      no_approval: 0x00100000,
      no_approval_under_100: 0x02000000,
    } satisfies Record<NonNullable<GroupManagementSettings['memberInvite']>, number>;

    param.filter.allowMemberInvite = 1;
    param.modifyInfo.allowMemberInvite = settings.memberInvite === 'disabled' ? 0 : 1;
    param.filter.appPrivilegeFlag = 1;
    param.filter.appPrivilegeMask = 1;
    param.modifyInfo.appPrivilegeMask |= MEMBER_INVITE_PRIVILEGE_MASK;
    param.modifyInfo.appPrivilegeFlag |= privilegeByPolicy[settings.memberInvite];
    changed = true;
  }

  if (settings.allowMemberUploadAlbum !== undefined) {
    param.filter.appPrivilegeFlag = 1;
    param.filter.appPrivilegeMask = 1;
    param.modifyInfo.appPrivilegeMask |= MEMBER_UPLOAD_ALBUM_PRIVILEGE_MASK;
    if (!settings.allowMemberUploadAlbum) param.modifyInfo.appPrivilegeFlag |= MEMBER_UPLOAD_ALBUM_PRIVILEGE_MASK;
    changed = true;
  }

  if (settings.allowMemberTemporarySession !== undefined) {
    param.filter.appPrivilegeFlag = 1;
    param.filter.appPrivilegeMask = 1;
    param.modifyInfo.appPrivilegeMask |= MEMBER_TEMPORARY_SESSION_FLAG;
    if (!settings.allowMemberTemporarySession) param.modifyInfo.appPrivilegeFlag |= MEMBER_TEMPORARY_SESSION_FLAG;
    changed = true;
  }

  if (settings.allowMemberCreateGroup !== undefined) {
    param.filter.appPrivilegeFlag = 1;
    param.filter.appPrivilegeMask = 1;
    param.modifyInfo.appPrivilegeMask |= MEMBER_CREATE_GROUP_FLAG;
    if (!settings.allowMemberCreateGroup) param.modifyInfo.appPrivilegeFlag |= MEMBER_CREATE_GROUP_FLAG;
    changed = true;
  }

  if (settings.newMembersSeeRecentHistory !== undefined) {
    param.filter.groupFlagExt4 = 1;
    param.filter.groupFlagExt4Mask = 1;
    param.modifyInfo.groupFlagExt4Mask |= NEW_MEMBER_RECENT_HISTORY_FLAG;
    if (settings.newMembersSeeRecentHistory) param.modifyInfo.groupFlagExt4 |= NEW_MEMBER_RECENT_HISTORY_FLAG;
    changed = true;
  }

  return changed;
}

export function createGroupManagementRequests (
  groupCode: string,
  settings: GroupManagementSettings,
  initialAppPrivilegeFlag = 0,
  initialGroupFlagExt4 = 0
) {
  const requests: Array<{ setting: string, param: GroupDetailInfoV2Param, operationType: number; }> = [];
  const requestSettings: Array<{
    setting: string,
    value: GroupManagementSettings,
    operationType: number;
  }> = [
    { setting: 'member_invite', value: { memberInvite: settings.memberInvite }, operationType: 0 },
    {
      setting: 'new_members_see_recent_history',
      value: { newMembersSeeRecentHistory: settings.newMembersSeeRecentHistory },
      operationType: 0,
    },
    {
      setting: 'allow_member_upload_album',
      value: { allowMemberUploadAlbum: settings.allowMemberUploadAlbum },
      operationType: 8,
    },
    {
      setting: 'allow_member_temporary_session',
      value: { allowMemberTemporarySession: settings.allowMemberTemporarySession },
      operationType: 8,
    },
    {
      setting: 'allow_member_create_group',
      value: { allowMemberCreateGroup: settings.allowMemberCreateGroup },
      operationType: 8,
    },
  ];

  let currentAppPrivilegeFlag = initialAppPrivilegeFlag;
  let currentGroupFlagExt4 = initialGroupFlagExt4;
  for (const requestSetting of requestSettings) {
    const param = createGroupDetailInfoV2Param(groupCode);
    if (applyGroupManagementSettings(param, requestSetting.value)) {
      if (param.filter.appPrivilegeFlag) {
        const nextAppPrivilegeFlag = mergeMaskedFlag(
          currentAppPrivilegeFlag,
          param.modifyInfo.appPrivilegeFlag,
          param.modifyInfo.appPrivilegeMask
        );
        if (requestSetting.operationType === 8 && nextAppPrivilegeFlag === currentAppPrivilegeFlag) continue;
        currentAppPrivilegeFlag = nextAppPrivilegeFlag;
        // Linux NTQQ's wrapper builds this field from the current complete privilege value.
        // Supplying only the targeted bit makes zero-valued clears get acknowledged but ignored.
        param.modifyInfo.appPrivilegeFlag = currentAppPrivilegeFlag;
      }
      if (param.filter.groupFlagExt4) {
        const nextGroupFlagExt4 = mergeMaskedFlag(
          currentGroupFlagExt4,
          param.modifyInfo.groupFlagExt4,
          param.modifyInfo.groupFlagExt4Mask
        );
        if (nextGroupFlagExt4 === currentGroupFlagExt4) continue;
        currentGroupFlagExt4 = nextGroupFlagExt4;
        param.modifyInfo.groupFlagExt4 = currentGroupFlagExt4;
      }
      requests.push({ setting: requestSetting.setting, param, operationType: requestSetting.operationType });
    }
  }

  return requests;
}

export function createGroupDetailInfoV2Param (group_code: string): GroupDetailInfoV2Param {
  return {
    groupCode: group_code,
    filter:
        {
          noCodeFingerOpenFlag: 0,
          noFingerOpenFlag: 0,
          groupName: 0,
          classExt: 0,
          classText: 0,
          fingerMemo: 0,
          richFingerMemo: 0,
          tagRecord: 0,
          groupGeoInfo:
            {
              ownerUid: 0,
              setTime: 0,
              cityId: 0,
              longitude: 0,
              latitude: 0,
              geoContent: 0,
              poiId: 0,
            },
          groupExtAdminNum: 0,
          flag: 0,
          groupMemo: 0,
          groupAioSkinUrl: 0,
          groupBoardSkinUrl: 0,
          groupCoverSkinUrl: 0,
          groupGrade: 0,
          activeMemberNum: 0,
          certificationType: 0,
          certificationText: 0,
          groupNewGuideLines:
            {
              enabled: 0,
              content: 0,
            },
          groupFace: 0,
          addOption: 0,
          shutUpTime: 0,
          groupTypeFlag: 0,
          appPrivilegeFlag: 0,
          appPrivilegeMask: 0,
          groupExtOnly:
            {
              tribeId: 0,
              moneyForAddGroup: 0,
            },
          groupSecLevel: 0,
          groupSecLevelInfo: 0,
          subscriptionUin: 0,
          subscriptionUid: '',
          allowMemberInvite: 0,
          groupQuestion: 0,
          groupAnswer: 0,
          groupFlagExt3: 0,
          groupFlagExt3Mask: 0,
          groupOpenAppid: 0,
          rootId: 0,
          msgLimitFrequency: 0,
          hlGuildAppid: 0,
          hlGuildSubType: 0,
          hlGuildOrgId: 0,
          groupFlagExt4: 0,
          groupFlagExt4Mask: 0,
          groupSchoolInfo: {
            location: 0,
            grade: 0,
            school: 0,
          },
          groupCardPrefix:
            {
              introduction: 0,
              rptPrefix: 0,
            },
          allianceId: 0,
          groupFlagPro1: 0,
          groupFlagPro1Mask: 0,
        },
    modifyInfo: {
      noCodeFingerOpenFlag: 0,
      noFingerOpenFlag: 0,
      groupName: '',
      classExt: 0,
      classText: '',
      fingerMemo: '',
      richFingerMemo: '',
      tagRecord: [],
      groupGeoInfo: {
        ownerUid: '',
        SetTime: 0,
        CityId: 0,
        Longitude: '',
        Latitude: '',
        GeoContent: '',
        poiId: '',
      },
      groupExtAdminNum: 0,
      flag: 0,
      groupMemo: '',
      groupAioSkinUrl: '',
      groupBoardSkinUrl: '',
      groupCoverSkinUrl: '',
      groupGrade: 0,
      activeMemberNum: 0,
      certificationType: 0,
      certificationText: '',
      groupNewGuideLines: {
        enabled: false,
        content: '',
      },
      groupFace: 0,
      addOption: 0,
      shutUpTime: 0,
      groupTypeFlag: 0,
      appPrivilegeFlag: 0,
      appPrivilegeMask: 0,
      groupExtOnly: {
        tribeId: 0,
        moneyForAddGroup: 0,
      },
      groupSecLevel: 0,
      groupSecLevelInfo: 0,
      subscriptionUin: '',
      subscriptionUid: '',
      allowMemberInvite: 0,
      groupQuestion: '',
      groupAnswer: '',
      groupFlagExt3: 0,
      groupFlagExt3Mask: 0,
      groupOpenAppid: 0,
      rootId: '',
      msgLimitFrequency: 0,
      hlGuildAppid: 0,
      hlGuildSubType: 0,
      hlGuildOrgId: 0,
      groupFlagExt4: 0,
      groupFlagExt4Mask: 0,
      groupSchoolInfo: {
        location: '',
        grade: 0,
        school: '',
      },
      groupCardPrefix:
            {
              introduction: '',
              rptPrefix: [],
            },
      allianceId: '',
      groupFlagPro1: 0,
      groupFlagPro1Mask: 0,
    },
  };
}
export function createGroupExtInfo (group_code: string): GroupExtInfo {
  return {
    groupCode: group_code,
    resultCode: 0,
    extInfo: {
      groupInfoExtSeq: 0,
      reserve: 0,
      luckyWordId: '',
      lightCharNum: 0,
      luckyWord: '',
      starId: 0,
      essentialMsgSwitch: 0,
      todoSeq: 0,
      blacklistExpireTime: 0,
      isLimitGroupRtc: 0,
      companyId: 0,
      hasGroupCustomPortrait: 0,
      bindGuildId: '',
      groupOwnerId: {
        memberUin: '',
        memberUid: '',
        memberQid: '',
      },
      essentialMsgPrivilege: 0,
      msgEventSeq: '',
      inviteRobotSwitch: 0,
      gangUpId: '',
      qqMusicMedalSwitch: 0,
      showPlayTogetherSwitch: 0,
      groupFlagPro1: '',
      groupBindGuildIds: {
        guildIds: [],
      },
      viewedMsgDisappearTime: '',
      groupExtFlameData: {
        switchState: 0,
        state: 0,
        dayNums: [],
        version: 0,
        updateTime: '',
        isDisplayDayNum: false,
      },
      groupBindGuildSwitch: 0,
      groupAioBindGuildId: '',
      groupExcludeGuildIds: {
        guildIds: [],
      },
      fullGroupExpansionSwitch: 0,
      fullGroupExpansionSeq: '',
      inviteRobotMemberSwitch: 0,
      inviteRobotMemberExamine: 0,
      groupSquareSwitch: 0,
    },
  };
}
export function createGroupExtFilter (): GroupExtFilter {
  return {
    groupInfoExtSeq: 0,
    reserve: 0,
    luckyWordId: 0,
    lightCharNum: 0,
    luckyWord: 0,
    starId: 0,
    essentialMsgSwitch: 0,
    todoSeq: 0,
    blacklistExpireTime: 0,
    isLimitGroupRtc: 0,
    companyId: 0,
    hasGroupCustomPortrait: 0,
    bindGuildId: 0,
    groupOwnerId: 0,
    essentialMsgPrivilege: 0,
    msgEventSeq: 0,
    inviteRobotSwitch: 0,
    gangUpId: 0,
    qqMusicMedalSwitch: 0,
    showPlayTogetherSwitch: 0,
    groupFlagPro1: 0,
    groupBindGuildIds: 0,
    viewedMsgDisappearTime: 0,
    groupExtFlameData: 0,
    groupBindGuildSwitch: 0,
    groupAioBindGuildId: 0,
    groupExcludeGuildIds: 0,
    fullGroupExpansionSwitch: 0,
    fullGroupExpansionSeq: 0,
    inviteRobotMemberSwitch: 0,
    inviteRobotMemberExamine: 0,
    groupSquareSwitch: 0,
  };
}
