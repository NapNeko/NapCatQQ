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