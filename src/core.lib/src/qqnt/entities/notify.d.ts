export declare enum GroupNotifyTypes {
    INVITE_ME = 1,
    INVITED_JOIN = 4,// 有人接受了邀请入群
    JOIN_REQUEST = 7,
    ADMIN_SET = 8,
    KICK_MEMBER = 9,
    MEMBER_EXIT = 11,// 主动退出
    ADMIN_UNSET = 12
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
