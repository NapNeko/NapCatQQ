import { ChatType } from '../entities';

export interface NodeIKernelSearchService {

    addKernelSearchListener(listener: unknown): number;

    removeKernelSearchListener(listenerId: number): void;

    searchStranger(unknown: string, searchStranger: unknown, searchParams: unknown): Promise<unknown>;

    searchGroup(...args: any[]): unknown;// needs 1 arguments

    searchLocalInfo(keywords: string, unknown: number/*4*/): unknown;

    cancelSearchLocalInfo(...args: any[]): unknown;// needs 3 arguments

    searchBuddyChatInfo(...args: any[]): unknown;// needs 2 arguments

    searchMoreBuddyChatInfo(...args: any[]): unknown;// needs 1 arguments

    cancelSearchBuddyChatInfo(...args: any[]): unknown;// needs 3 arguments

    searchContact(...args: any[]): unknown;// needs 2 arguments

    searchMoreContact(...args: any[]): unknown;// needs 1 arguments

    cancelSearchContact(...args: any[]): unknown;// needs 3 arguments

    searchGroupChatInfo(...args: any[]): unknown;// needs 3 arguments

    resetSearchGroupChatInfoSortType(...args: any[]): unknown;// needs 3 arguments

    resetSearchGroupChatInfoFilterMembers(...args: any[]): unknown;// needs 3 arguments

    searchMoreGroupChatInfo(...args: any[]): unknown;// needs 1 arguments

    cancelSearchGroupChatInfo(...args: any[]): unknown;// needs 3 arguments

    searchChatsWithKeywords(...args: any[]): unknown;// needs 3 arguments

    searchMoreChatsWithKeywords(...args: any[]): unknown;// needs 1 arguments

    cancelSearchChatsWithKeywords(...args: any[]): unknown;// needs 3 arguments

    searchChatMsgs(...args: any[]): unknown;// needs 2 arguments

    searchMoreChatMsgs(...args: any[]): unknown;// needs 1 arguments

    cancelSearchChatMsgs(...args: any[]): unknown;// needs 3 arguments

    searchMsgWithKeywords(...args: any[]): unknown;// needs 2 arguments

    searchMoreMsgWithKeywords(...args: any[]): unknown;// needs 1 arguments

    cancelSearchMsgWithKeywords(...args: any[]): unknown;// needs 3 arguments

    searchFileWithKeywords(keywords: string[], source: number): Promise<string>;// needs 2 arguments

    searchMoreFileWithKeywords(...args: any[]): unknown;// needs 1 arguments

    cancelSearchFileWithKeywords(...args: any[]): unknown;// needs 3 arguments

    searchAtMeChats(...args: any[]): unknown;// needs 3 arguments

    searchMoreAtMeChats(...args: any[]): unknown;// needs 1 arguments

    cancelSearchAtMeChats(...args: any[]): unknown;// needs 3 arguments

    searchChatAtMeMsgs(...args: any[]): unknown;// needs 1 arguments

    searchMoreChatAtMeMsgs(...args: any[]): unknown;// needs 1 arguments

    cancelSearchChatAtMeMsgs(...args: any[]): unknown;// needs 3 arguments

    addSearchHistory(param: {
        type: number,//4
        contactList: [],
        id: number,//-1
        groupInfos: [],
        msgs: [],
        fileInfos: [
            {
                chatType: ChatType,
                buddyChatInfo: Array<{ category_name: string, peerUid: string, peerUin: string, remark: string }>,
                discussChatInfo: [],
                groupChatInfo: Array<
                    {
                        groupCode: string,
                        isConf: boolean,
                        hasModifyConfGroupFace: boolean,
                        hasModifyConfGroupName: boolean,
                        groupName: string,
                        remark: string
                    }>,
                dataLineChatInfo: [],
                tmpChatInfo: [],
                msgId: string,
                msgSeq: string,
                msgTime: string,
                senderUid: string,
                senderNick: string,
                senderRemark: string,
                senderCard: string,
                elemId: string,
                elemType: string,//3
                fileSize: string,
                filePath: string,
                fileName: string,
                hits: Array<
                    {
                        start: 12,
                        end: 14
                    }
                >
            }
        ]

    }): Promise<{
        result: number,
        errMsg: string,
        id?: number
    }>;

    removeSearchHistory(...args: any[]): unknown;// needs 1 arguments

    searchCache(...args: any[]): unknown;// needs 3 arguments

    clearSearchCache(...args: any[]): unknown;// needs 1 arguments

}
