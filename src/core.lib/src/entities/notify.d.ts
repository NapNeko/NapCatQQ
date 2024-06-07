export declare enum GroupNotifyTypes {
    INVITE_ME = 1,
    INVITED_JOIN = 4,// 有人接受了邀请入群
    JOIN_REQUEST = 7,
    ADMIN_SET = 8,
    KICK_MEMBER = 9,
    MEMBER_EXIT = 11,// 主动退出
    ADMIN_UNSET = 12,
    ADMIN_UNSET_OTHER = 13
}
export interface GroupNotifies {
    doubt: boolean;
    nextStartSeq: string;
    notifies: GroupNotify[];
}
export declare enum GroupNotifyStatus {
    IGNORE = 0,
    WAIT_HANDLE = 1,
    APPROVE = 2,
    REJECT = 3
}
export interface GroupNotify {
    time: number;
    seq: string;
    type: GroupNotifyTypes;
    status: GroupNotifyStatus;
    group: {
        groupCode: string;
        groupName: string;
    };
    user1: {
        uid: string;
        nickName: string;
    };
    user2: {
        uid: string;
        nickName: string;
    };
    actionUser: {
        uid: string;
        nickName: string;
    };
    actionTime: string;
    invitationExt: {
        srcType: number;
        groupCode: string;
        waitStatus: number;
    };
    postscript: string;
    repeatSeqs: [];
    warningTips: string;
}
export declare enum GroupRequestOperateTypes {
    approve = 1,
    reject = 2
}
export interface FriendRequest {
    friendUid: string;
    reqTime: string;
    extWords: string;
    isUnread: boolean;
    friendNick: string;
    sourceId: number;
    groupCode: string;
}
export interface FriendRequestNotify {
    unreadNums: number;
    buddyReqs: FriendRequest[];
}
export declare enum MemberExtSourceType {
    DEFAULTTYPE = 0,
    TITLETYPE = 1,
    NEWGROUPTYPE = 2
}
export interface GroupExtParam {
    groupCode: string;
    seq: string;
    beginUin: string;
    dataTime: string;
    uinList: Array<string>;
    uinNum: string;
    groupType: string;
    richCardNameVer: string;
    sourceType: MemberExtSourceType;
    memberExtFilter: {
        memberLevelInfoUin: number;
        memberLevelInfoPoint: number;
        memberLevelInfoActiveDay: number;
        memberLevelInfoLevel: number;
        memberLevelInfoName: number;
        levelName: number;
        dataTime: number;
        userShowFlag: number;
        sysShowFlag: number;
        timeToUpdate: number;
        nickName: number;
        specialTitle: number;
        levelNameNew: number;
        userShowFlagNew: number;
        msgNeedField: number;
        cmdUinFlagExt3Grocery: number;
        memberIcon: number;
        memberInfoSeq: number;
    };
}
