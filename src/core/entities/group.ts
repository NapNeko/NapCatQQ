import { QQLevel, Sex } from './user';

export interface KickMemberInfo {
    optFlag: number,
    optOperate: number,
    optMemberUid: string,
    optBytesMsg: string,
}
//getGroupDetailInfo GroupCode,GroupInfoSource
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
    groupCode: string,
    kickFlag: number,
    kickList: Array<KickMemberInfo>,
    kickListUids: Array<string>,
    kickMsg: string
}

export enum DataSource {
    LOCAL,
    REMOTE
}

export enum GroupListUpdateType {
    REFRESHALL,
    GETALL,
    MODIFIED,
    REMOVE
}

export interface GroupMemberCache {
    group: {
        data: GroupMember[];
        isExpired: boolean;
    };
    isExpired: boolean;
}

export interface Group {
    groupCode: string,
    createTime?: string,//高版本才有
    maxMember: number,
    memberCount: number,
    groupName: string,
    groupStatus: number,
    memberRole: number,
    isTop: boolean,
    toppedTimestamp: string,
    privilegeFlag: number, //65760
    isConf: boolean,
    hasModifyConfGroupFace: boolean,
    hasModifyConfGroupName: boolean,
    remarkName: string,
    hasMemo: boolean,
    groupShutupExpireTime: string, //"0",
    personShutupExpireTime: string, //"0",
    discussToGroupUin: string, //"0",
    discussToGroupMaxMsgSeq: number,
    discussToGroupTime: number,
    groupFlagExt: number, //1073938496,
    authGroupType: number, //0,
    groupCreditLevel: number, //0,
    groupFlagExt3: number, //0,
    groupOwnerId: {
        memberUin: string, //"0",
        memberUid: string, //"u_fbf8N7aeuZEnUiJAbQ9R8Q"
    }
}

export enum GroupMemberRole {
    normal = 2,
    admin = 3,
    owner = 4
}

export interface GroupMember {
    memberSpecialTitle?: string;
    avatarPath: string;
    cardName: string;
    cardType: number;
    isDelete: boolean;
    nick: string;
    qid: string;
    remark: string;
    role: GroupMemberRole; // 群主:4, 管理员:3，群员:2
    shutUpTime: number; // 禁言时间，单位是什么暂时不清楚
    uid: string; // 加密的字符串
    uin: string; // QQ号
    isRobot: boolean;
    sex?: Sex;
    age?: number;
    qqLevel?: QQLevel;
    isChangeRole: boolean;
    joinTime: string;
    lastSpeakTime: string;
}
