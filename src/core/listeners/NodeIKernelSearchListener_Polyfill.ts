import { ChatType } from '@/core';

export interface NodeIKernelSearchListener_Polyfill {
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
