import { ChatType, Peer } from '@/core/types';
import { GeneralCallResult } from './common';

export interface NodeIKernelSearchService {

    addKernelSearchListener(listener: unknown): number;

    removeKernelSearchListener(listenerId: number): void;

    searchStranger(unknown: string, searchStranger: unknown, searchParams: unknown): Promise<unknown>;

    searchGroup(param: {
        keyWords: string,
        groupNum: number,
        exactSearch: boolean,
        penetrate: string
    }): Promise<GeneralCallResult>;// needs 1 arguments

    searchLocalInfo(keywords: string, type: number/*4*/): unknown;

    cancelSearchLocalInfo(...args: unknown[]): unknown;// needs 3 arguments

    searchBuddyChatInfo(...args: unknown[]): unknown;// needs 2 arguments

    searchMoreBuddyChatInfo(...args: unknown[]): unknown;// needs 1 arguments

    cancelSearchBuddyChatInfo(...args: unknown[]): unknown;// needs 3 arguments

    searchContact(...args: unknown[]): unknown;// needs 2 arguments

    searchMoreContact(...args: unknown[]): unknown;// needs 1 arguments

    cancelSearchContact(...args: unknown[]): unknown;// needs 3 arguments

    searchGroupChatInfo(...args: unknown[]): unknown;// needs 3 arguments

    resetSearchGroupChatInfoSortType(...args: unknown[]): unknown;// needs 3 arguments

    resetSearchGroupChatInfoFilterMembers(...args: unknown[]): unknown;// needs 3 arguments

    searchMoreGroupChatInfo(...args: unknown[]): unknown;// needs 1 arguments

    cancelSearchGroupChatInfo(...args: unknown[]): unknown;// needs 3 arguments

    searchChatsWithKeywords(...args: unknown[]): unknown;// needs 3 arguments

    searchMoreChatsWithKeywords(...args: unknown[]): unknown;// needs 1 arguments

    cancelSearchChatsWithKeywords(...args: unknown[]): unknown;// needs 3 arguments

    searchChatMsgs(...args: unknown[]): unknown;// needs 2 arguments

    searchMoreChatMsgs(...args: unknown[]): unknown;// needs 1 arguments

    cancelSearchChatMsgs(...args: unknown[]): unknown;// needs 3 arguments

    searchMsgWithKeywords(keyWords: string[], param: Peer & { searchFields: number, pageLimit: number }): Promise<GeneralCallResult>;

    searchMoreMsgWithKeywords(...args: unknown[]): unknown;// needs 1 arguments

    cancelSearchMsgWithKeywords(...args: unknown[]): unknown;// needs 3 arguments

    searchFileWithKeywords(keywords: string[], source: number): Promise<string>;// needs 2 arguments

    searchMoreFileWithKeywords(...args: unknown[]): unknown;// needs 1 arguments

    cancelSearchFileWithKeywords(...args: unknown[]): unknown;// needs 3 arguments

    searchAtMeChats(...args: unknown[]): unknown;// needs 3 arguments

    searchMoreAtMeChats(...args: unknown[]): unknown;// needs 1 arguments

    cancelSearchAtMeChats(...args: unknown[]): unknown;// needs 3 arguments

    searchChatAtMeMsgs(...args: unknown[]): unknown;// needs 1 arguments

    searchMoreChatAtMeMsgs(...args: unknown[]): unknown;// needs 1 arguments

    cancelSearchChatAtMeMsgs(...args: unknown[]): unknown;// needs 3 arguments

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

    removeSearchHistory(...args: unknown[]): unknown;// needs 1 arguments

    searchCache(...args: unknown[]): unknown;// needs 3 arguments

    clearSearchCache(...args: unknown[]): unknown;// needs 1 arguments

}
