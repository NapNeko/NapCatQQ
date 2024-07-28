export interface NodeIKernelSearchService {
    addKernelSearchListener(...args: any[]): unknown;// needs 1 arguments

    removeKernelSearchListener(...args: any[]): unknown;// needs 1 arguments

    searchStranger(...args: any[]): unknown;// needs 3 arguments

    searchGroup(...args: any[]): unknown;// needs 1 arguments

    searchLocalInfo(keywords: string,unknown:number/*4*/): unknown;

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

    addSearchHistory(...args: any[]): unknown;// needs 1 arguments

    removeSearchHistory(...args: any[]): unknown;// needs 1 arguments

    searchCache(...args: any[]): unknown;// needs 3 arguments

    clearSearchCache(...args: any[]): unknown;// needs 1 arguments
}
