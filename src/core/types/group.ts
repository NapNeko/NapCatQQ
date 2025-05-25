import { QQLevel, NTSex } from './user';
export interface GroupExtInfo {
    groupCode: string;
    resultCode: number;
    extInfo: EXTInfo;
}
export interface GroupExtFilter {
    groupInfoExtSeq: number;
    reserve: number;
    luckyWordId: number;
    lightCharNum: number;
    luckyWord: number;
    starId: number;
    essentialMsgSwitch: number;
    todoSeq: number;
    blacklistExpireTime: number;
    isLimitGroupRtc: number;
    companyId: number;
    hasGroupCustomPortrait: number;
    bindGuildId: number;
    groupOwnerId: number;
    essentialMsgPrivilege: number;
    msgEventSeq: number;
    inviteRobotSwitch: number;
    gangUpId: number;
    qqMusicMedalSwitch: number;
    showPlayTogetherSwitch: number;
    groupFlagPro1: number;
    groupBindGuildIds: number;
    viewedMsgDisappearTime: number;
    groupExtFlameData: number;
    groupBindGuildSwitch: number;
    groupAioBindGuildId: number;
    groupExcludeGuildIds: number;
    fullGroupExpansionSwitch: number;
    fullGroupExpansionSeq: number;
    inviteRobotMemberSwitch: number;
    inviteRobotMemberExamine: number;
    groupSquareSwitch: number;
};

export interface EXTInfo {
    groupInfoExtSeq: number;
    reserve: number;
    luckyWordId: string;
    lightCharNum: number;
    luckyWord: string;
    starId: number;
    essentialMsgSwitch: number;
    todoSeq: number;
    blacklistExpireTime: number;
    isLimitGroupRtc: number;
    companyId: number;
    hasGroupCustomPortrait: number;
    bindGuildId: string;
    groupOwnerId: GroupOwnerID;
    essentialMsgPrivilege: number;
    msgEventSeq: string;
    inviteRobotSwitch: number;
    gangUpId: string;
    qqMusicMedalSwitch: number;
    showPlayTogetherSwitch: number;
    groupFlagPro1: string;
    groupBindGuildIds: GroupGuildIDS;
    viewedMsgDisappearTime: string;
    groupExtFlameData: GroupEXTFlameData;
    groupBindGuildSwitch: number;
    groupAioBindGuildId: string;
    groupExcludeGuildIds: GroupGuildIDS;
    fullGroupExpansionSwitch: number;
    fullGroupExpansionSeq: string;
    inviteRobotMemberSwitch: number;
    inviteRobotMemberExamine: number;
    groupSquareSwitch: number;
}

export interface GroupGuildIDS {
    guildIds: any[];
}

export interface GroupEXTFlameData {
    switchState: number;
    state: number;
    dayNums: any[];
    version: number;
    updateTime: string;
    isDisplayDayNum: boolean;
}

export interface GroupOwnerID {
    memberUin: string;
    memberUid: string;
    memberQid: string;
}

export interface KickMemberInfo {
    optFlag: number;
    optOperate: number;
    optMemberUid: string;
    optBytesMsg: string;
}


export interface GroupDetailInfoV2Param {
    groupCode: string;
    filter: Filter;
    modifyInfo: ModifyInfo;
}

export interface Filter {
    noCodeFingerOpenFlag: number;
    noFingerOpenFlag: number;
    groupName: number;
    classExt: number;
    classText: number;
    fingerMemo: number;
    richFingerMemo: number;
    tagRecord: number;
    groupGeoInfo: FilterGroupGeoInfo;
    groupExtAdminNum: number;
    flag: number;
    groupMemo: number;
    groupAioSkinUrl: number;
    groupBoardSkinUrl: number;
    groupCoverSkinUrl: number;
    groupGrade: number;
    activeMemberNum: number;
    certificationType: number;
    certificationText: number;
    groupNewGuideLines: FilterGroupNewGuideLines;
    groupFace: number;
    addOption: number;
    shutUpTime: number;
    groupTypeFlag: number;
    appPrivilegeFlag: number;
    appPrivilegeMask: number;
    groupExtOnly: GroupEXTOnly;
    groupSecLevel: number;
    groupSecLevelInfo: number;
    subscriptionUin: number;
    subscriptionUid: string;
    allowMemberInvite: number;
    groupQuestion: number;
    groupAnswer: number;
    groupFlagExt3: number;
    groupFlagExt3Mask: number;
    groupOpenAppid: number;
    rootId: number;
    msgLimitFrequency: number;
    hlGuildAppid: number;
    hlGuildSubType: number;
    hlGuildOrgId: number;
    groupFlagExt4: number;
    groupFlagExt4Mask: number;
    groupSchoolInfo: FilterGroupSchoolInfo;
    groupCardPrefix: FilterGroupCardPrefix;
    allianceId: number;
    groupFlagPro1: number;
    groupFlagPro1Mask: number;
}

export interface FilterGroupCardPrefix {
    introduction: number;
    rptPrefix: number;
}

export interface GroupEXTOnly {
    tribeId: number;
    moneyForAddGroup: number;
}

export interface FilterGroupGeoInfo {
    ownerUid: number;
    setTime: number;
    cityId: number;
    longitude: number;
    latitude: number;
    geoContent: number;
    poiId: number;
}

export interface FilterGroupNewGuideLines {
    enabled: number;
    content: number;
}

export interface FilterGroupSchoolInfo {
    location: number;
    grade: number;
    school: number;
}

export interface ModifyInfo {
    noCodeFingerOpenFlag: number;
    noFingerOpenFlag: number;
    groupName: string;
    classExt: number;
    classText: string;
    fingerMemo: string;
    richFingerMemo: string;
    tagRecord: any[];
    groupGeoInfo: ModifyInfoGroupGeoInfo;
    groupExtAdminNum: number;
    flag: number;
    groupMemo: string;
    groupAioSkinUrl: string;
    groupBoardSkinUrl: string;
    groupCoverSkinUrl: string;
    groupGrade: number;
    activeMemberNum: number;
    certificationType: number;
    certificationText: string;
    groupNewGuideLines: ModifyInfoGroupNewGuideLines;
    groupFace: number;
    addOption: number;// 0 空设置 1 任何人都可以进入 2 需要管理员批准 3 不允许任何人入群 4 问题进入答案 5 问题管理员批准
    shutUpTime: number;
    groupTypeFlag: number;
    appPrivilegeFlag: number;
    // 需要管理员审核
    // 0000 0000 0000 0000 0000 0000 0000
    // 无需审核入群
    // 0000 0001 0000 0000 0000 0000 0000
    // 成员数100内无审核
    // 0100 0000 0000 0000 0000 0000 0000
    // 禁用 群成员邀请好友
    // 0100 0000 0000 0000 0000 0000 0000

    appPrivilegeMask: number;
    // 0110 0001 0000 0000 0000 0000 0000
    // 101711872
    groupExtOnly: GroupEXTOnly;
    groupSecLevel: number;
    groupSecLevelInfo: number;
    subscriptionUin: string;
    subscriptionUid: string;
    allowMemberInvite: number;
    groupQuestion: string;
    groupAnswer: string;
    groupFlagExt3: number;
    groupFlagExt3Mask: number;
    groupOpenAppid: number;
    rootId: string;
    msgLimitFrequency: number;
    hlGuildAppid: number;
    hlGuildSubType: number;
    hlGuildOrgId: number;
    groupFlagExt4: number;
    groupFlagExt4Mask: number;
    groupSchoolInfo: ModifyInfoGroupSchoolInfo;
    groupCardPrefix: ModifyInfoGroupCardPrefix;
    allianceId: string;
    groupFlagPro1: number;
    groupFlagPro1Mask: number;
}

export interface ModifyInfoGroupCardPrefix {
    introduction: string;
    rptPrefix: any[];
}

export interface ModifyInfoGroupGeoInfo {
    ownerUid: string;
    SetTime: number;
    CityId: number;
    Longitude: string;
    Latitude: string;
    GeoContent: string;
    poiId: string;
}

export interface ModifyInfoGroupNewGuideLines {
    enabled: boolean;
    content: string;
}

export interface ModifyInfoGroupSchoolInfo {
    location: string;
    grade: number;
    school: string;
}

// 获取群详细信息的来源类型
export enum GroupInfoSource {
    KUNSPECIFIED,
    KBIGDATACARD,
    KDATACARD,
    KNOTICE,
    KAIO,
    KRECENTCONTACT,
    KMOREPANEL
}
export interface GroupDetailInfo {
    groupCode: string;
    groupUin: string;
    ownerUid: string;
    ownerUin: string;
    groupFlag: number;
    groupFlagExt: number;
    maxMemberNum: number;
    memberNum: number;
    groupOption: number;
    classExt: number;
    groupName: string;
    fingerMemo: string;
    groupQuestion: string;
    certType: number;
    richFingerMemo: string;
    tagRecord: unknown[];
    shutUpAllTimestamp: number;
    shutUpMeTimestamp: number;
    groupTypeFlag: number;
    privilegeFlag: number;
    groupSecLevel: number;
    groupFlagExt3: number;
    isConfGroup: number;
    isModifyConfGroupFace: number;
    isModifyConfGroupName: number;
    groupFlagExt4: number;
    groupMemo: string;
    cmdUinMsgSeq: number;
    cmdUinJoinTime: number;
    cmdUinUinFlag: number;
    cmdUinMsgMask: number;
    groupSecLevelInfo: number;
    cmdUinPrivilege: number;
    cmdUinFlagEx2: number;
    appealDeadline: number;
    remarkName: string;
    isTop: boolean;
    groupFace: number;
    groupGeoInfo: {
        ownerUid: string;
        SetTime: number;
        CityId: number;
        Longitude: string;
        Latitude: string;
        GeoContent: string;
        poiId: string;
    };
    certificationText: string;
    cmdUinRingtoneId: number;
    longGroupName: string;
    autoAgreeJoinGroupUserNumForConfGroup: number;
    autoAgreeJoinGroupUserNumForNormalGroup: number;
    cmdUinFlagExt3Grocery: number;
    groupCardPrefix: {
        introduction: string;
        rptPrefix: unknown[];
    };
    groupExt: {
        groupInfoExtSeq: number;
        reserve: number;
        luckyWordId: string;
        lightCharNum: number;
        luckyWord: string;
        starId: number;
        essentialMsgSwitch: number;
        todoSeq: number;
        blacklistExpireTime: number;
        isLimitGroupRtc: number;
        companyId: number;
        hasGroupCustomPortrait: number;
        bindGuildId: string;
        groupOwnerId: {
            memberUin: string;
            memberUid: string;
            memberQid: string;
        };
        essentialMsgPrivilege: number;
        msgEventSeq: string;
        inviteRobotSwitch: number;
        gangUpId: string;
        qqMusicMedalSwitch: number;
        showPlayTogetherSwitch: number;
        groupFlagPro1: string;
        groupBindGuildIds: {
            guildIds: unknown[];
        };
        viewedMsgDisappearTime: string;
        groupExtFlameData: {
            switchState: number;
            state: number;
            dayNums: unknown[];
            version: number;
            updateTime: string;
            isDisplayDayNum: boolean;
        };
        groupBindGuildSwitch: number;
        groupAioBindGuildId: string;
        groupExcludeGuildIds: {
            guildIds: unknown[];
        };
        fullGroupExpansionSwitch: number;
        fullGroupExpansionSeq: string;
        inviteRobotMemberSwitch: number;
        inviteRobotMemberExamine: number;
        groupSquareSwitch: number;
    };
    msgLimitFrequency: number;
    hlGuildAppid: number;
    hlGuildSubType: number;
    isAllowRecallMsg: number;
    confUin: string;
    confMaxMsgSeq: number;
    confToGroupTime: number;
    groupSchoolInfo: {
        location: string;
        grade: number;
        school: string;
    };
    activeMemberNum: number;
    groupGrade: number;
    groupCreateTime: number;
    subscriptionUin: string;
    subscriptionUid: string;
    noFingerOpenFlag: number;
    noCodeFingerOpenFlag: number;
    isGroupFreeze: number;
    allianceId: string;
    groupExtOnly: {
        tribeId: number;
        moneyForAddGroup: number;
    };
    isAllowConfGroupMemberModifyGroupName: number;
    isAllowConfGroupMemberNick: number;
    isAllowConfGroupMemberAtAll: number;
    groupClassText: string;
    groupFreezeReason: number;
    headPortraitSeq: number;
    groupHeadPortrait: {
        portraitCnt: number;
        portraitInfo: unknown[];
        defaultId: number;
        verifyingPortraitCnt: number;
        verifyingPortraitInfo: unknown[];
    };
    cmdUinJoinMsgSeq: number;
    cmdUinJoinRealMsgSeq: number;
    groupAnswer: string;
    groupAdminMaxNum: number;
    inviteNoAuthNumLimit: string;
    hlGuildOrgId: number;
    isAllowHlGuildBinary: number;
    localExitGroupReason: number;
}
export interface GroupExt0xEF0InfoFilter {
    bindGuildId: number;
    blacklistExpireTime: number;
    companyId: number;
    essentialMsgPrivilege: number;
    essentialMsgSwitch: number;
    fullGroupExpansionSeq: number;
    fullGroupExpansionSwitch: number;
    gangUpId: number;
    groupAioBindGuildId: number;
    groupBindGuildIds: number;
    groupBindGuildSwitch: number;
    groupExcludeGuildIds: number;
    groupExtFlameData: number;
    groupFlagPro1: number;
    groupInfoExtSeq: number;
    groupOwnerId: number;
    groupSquareSwitch: number;
    hasGroupCustomPortrait: number;
    inviteRobotMemberExamine: number;
    inviteRobotMemberSwitch: number;
    inviteRobotSwitch: number;
    isLimitGroupRtc: number;
    lightCharNum: number;
    luckyWord: number;
    luckyWordId: number;
    msgEventSeq: number;
    qqMusicMedalSwitch: number;
    reserve: number;
    showPlayTogetherSwitch: number;
    starId: number;
    todoSeq: number;
    viewedMsgDisappearTime: number;
}

export interface KickMemberV2Req {
    groupCode: string;
    kickFlag: number;
    kickList: Array<KickMemberInfo>;
    kickListUids: Array<string>;
    kickMsg: string;
}

// 数据来源类型
export enum DataSource {
    LOCAL = 0,
    REMOTE = 1
}

// 群列表更新类型
export enum GroupListUpdateType {
    REFRESHALL = 0,
    GETALL = 1,
    MODIFIED = 2,
    REMOVE = 3
}

export interface GroupMemberCache {
    group: {
        data: GroupMember[];
        isExpired: boolean;
    };
    isExpired: boolean;
}

export interface Group {
    groupCode: string;
    createTime?: string;
    maxMember: number;
    memberCount: number;
    groupName: string;
    groupStatus: number;
    memberRole: number;
    isTop: boolean;
    toppedTimestamp: string;
    privilegeFlag: number;
    isConf: boolean;
    hasModifyConfGroupFace: boolean;
    hasModifyConfGroupName: boolean;
    remarkName: string;
    hasMemo: boolean;
    groupShutupExpireTime: string;
    personShutupExpireTime: string;
    discussToGroupUin: string;
    discussToGroupMaxMsgSeq: number;
    discussToGroupTime: number;
    groupFlagExt: number;
    authGroupType: number;
    groupCreditLevel: number;
    groupFlagExt3: number;
    groupOwnerId: {
        memberUin: string;
        memberUid: string;
    };
}
export enum NTGroupMemberRole {
    KUNSPECIFIED = 0,
    KSTRANGER = 1,
    KMEMBER = 2,
    KADMIN = 3,
    KOWNER = 4
}
export interface GroupMember {
    memberRealLevel: number | undefined;
    memberSpecialTitle?: string;
    avatarPath: string;
    cardName: string;
    cardType: number;
    isDelete: boolean;
    nick: string;
    qid: string;
    remark: string;
    role: NTGroupMemberRole;
    shutUpTime: number; // 禁言时间(S)
    uid: string;
    uin: string;
    isRobot: boolean;
    sex?: NTSex;
    age?: number;
    qqLevel?: QQLevel;
    isChangeRole: boolean;
    joinTime: string;
    lastSpeakTime: string;
}