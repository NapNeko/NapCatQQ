import { QQLevel, Sex } from './user';

export interface Group {
    groupCode: string;
    maxMember: number;
    memberCount: number;
    groupName: string;
    groupStatus: 0;
    memberRole: 2;
    isTop: boolean;
    toppedTimestamp: '0';
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
        'memberUin': string;
        'memberUid': string;
    };
}
export declare enum GroupMemberRole {
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
    role: GroupMemberRole;
    shutUpTime: number;
    uid: string;
    uin: string;
    isRobot: boolean;
    sex?: Sex;
    qqLevel?: QQLevel;
}
