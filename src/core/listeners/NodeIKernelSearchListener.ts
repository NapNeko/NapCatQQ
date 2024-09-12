import { ChatType } from '@/core';
export interface SearchGroupInfo {
    groupCode: string;
    ownerUid: string;
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
    shutUpAllTimestamp: number;
    shutUpMeTimestamp: number;
    groupTypeFlag: number;
    privilegeFlag: number;
    groupSecLevel: number;
    groupFlagExt3: number;
    isConfGroup: number;
    isModifyConfGroupFace: number;
    isModifyConfGroupName: number;
    noFigerOpenFlag: number;
    noCodeFingerOpenFlag: number;
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
    richFingerMemo: string;
    groupAnswer: string;
    joinGroupAuth: string;
    isAllowModifyConfGroupName: number;
}

export interface GroupInfo {
    groupCode: string;
    searchGroupInfo: SearchGroupInfo;
    privilege: number;
}

export interface GroupSearchResult {
    keyWord: string;
    errorCode: number;
    groupInfos: GroupInfo[];
    penetrate: string;
    isEnd: boolean;
    nextPos: number;
}
export interface NodeIKernelSearchListener {
    
    onSearchGroupResult(params: GroupSearchResult): void;

    onSearchFileKeywordsResult(params: {
        searchId: string,
        hasMore: boolean,
        resultItems: {
            chatType: ChatType,
            buddyChatInfo: any[],
            discussChatInfo: any[],
            groupChatInfo: {
                groupCode: string,
                isConf: boolean,
                hasModifyConfGroupFace: boolean,
                hasModifyConfGroupName: boolean,
                groupName: string,
                remark: string
            }[],
            dataLineChatInfo: any[],
            tmpChatInfo: any[],
            msgId: string,
            msgSeq: string,
            msgTime: string,
            senderUid: string,
            senderNick: string,
            senderRemark: string,
            senderCard: string,
            elemId: string,
            elemType: number,
            fileSize: string,
            filePath: string,
            fileName: string,
            hits: {
                start: number,
                end: number
            }[]
        }[]
    }): void;
}
