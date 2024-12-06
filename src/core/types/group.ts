import { QQLevel, NTSex } from './user';

export interface KickMemberInfo {
    optFlag: number;
    optOperate: number;
    optMemberUid: string;
    optBytesMsg: string;
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
    tagRecord: any[];
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
        rptPrefix: any[];
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
            guildIds: any[];
        };
        viewedMsgDisappearTime: string;
        groupExtFlameData: {
            switchState: number;
            state: number;
            dayNums: any[];
            version: number;
            updateTime: string;
            isDisplayDayNum: boolean;
        };
        groupBindGuildSwitch: number;
        groupAioBindGuildId: string;
        groupExcludeGuildIds: {
            guildIds: any[];
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
        portraitInfo: any[];
        defaultId: number;
        verifyingPortraitCnt: number;
        verifyingPortraitInfo: any[];
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