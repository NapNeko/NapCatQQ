import { ChatType, Peer } from '@/napcat-core/types';
import { GeneralCallResult } from './common';

export interface NodeIKernelSearchService {

  addKernelSearchListener (listener: unknown): number;

  removeKernelSearchListener (listenerId: number): void;

  searchStranger (keyword: string, searchType: unknown, searchParams: unknown): Promise<unknown>;

  searchGroup (param: {
    keyWords: string,
    groupNum: number,
    exactSearch: boolean,
    penetrate: string;
  }): Promise<GeneralCallResult>;

  searchLocalInfo (keywords: string, type: number): unknown;

  cancelSearchLocalInfo (arg1: number, arg2: number, arg3: string): unknown;

  searchBuddyChatInfo (arg1: unknown, arg2: unknown): unknown;

  searchMoreBuddyChatInfo (arg: unknown): unknown;

  cancelSearchBuddyChatInfo (arg1: number, arg2: number, arg3: string): unknown;

  searchContact (arg1: Array<unknown>[], arg2: unknown): unknown;

  searchMoreContact (arg: unknown): unknown;

  cancelSearchContact (arg1: number, arg2: number, arg3: string): unknown;

  searchGroupChatInfo (arg1: unknown[], arg2: unknown, arg3: number): unknown;

  resetSearchGroupChatInfoSortType (arg1: number, arg2: number, arg3: number): unknown;

  resetSearchGroupChatInfoFilterMembers (arg1: number, arg2: Array<unknown>[], arg3: number): unknown;

  searchMoreGroupChatInfo (arg: unknown): unknown;

  cancelSearchGroupChatInfo (arg1: number, arg2: number, arg3: string): unknown;

  searchChatsWithKeywords (arg1: unknown[], arg2: number, arg3: number): unknown;

  searchMoreChatsWithKeywords (arg: unknown): unknown;

  cancelSearchChatsWithKeywords (arg1: number, arg2: number, arg3: string): unknown;

  searchChatMsgs (arg1: Array<unknown>[], arg2: unknown): unknown;

  searchMoreChatMsgs (arg: unknown): unknown;

  cancelSearchChatMsgs (arg1: number, arg2: number, arg3: string): unknown;

  searchMsgWithKeywords (keyWords: string[], param: Peer & { searchFields: number, pageLimit: number; }): Promise<GeneralCallResult>;

  searchMoreMsgWithKeywords (arg: unknown): unknown;

  cancelSearchMsgWithKeywords (arg1: number, arg2: number, arg3: string): unknown;

  searchFileWithKeywords (keywords: string[], source: number): Promise<string>;

  searchMoreFileWithKeywords (arg: unknown): unknown;

  cancelSearchFileWithKeywords (arg1: number, arg2: number, arg3: string): unknown;

  searchFileInFileCenterForPC (arg1: unknown, arg2: unknown): unknown;

  searchMoreFileInFileCenter (arg: unknown): unknown;

  cancelSearchFileInFileCenter (arg1: number, arg2: number, arg3: string): unknown;

  searchAtMeChats (arg1: boolean, arg2: number, arg3: number): unknown;

  searchMoreAtMeChats (arg: unknown): unknown;

  cancelSearchAtMeChats (arg1: number, arg2: number, arg3: string): unknown;

  searchChatAtMeMsgs (arg: unknown): unknown;

  searchMoreChatAtMeMsgs (arg: unknown): unknown;

  cancelSearchChatAtMeMsgs (arg1: number, arg2: number, arg3: string): unknown;

  searchRobot (arg: unknown): unknown;

  searchCache (arg1: string, arg2: string, arg3: unknown): unknown;

  addSearchHistory (param: {
    type: number,
    contactList: [],
    id: number,
    groupInfos: [],
    msgs: [],
    fileInfos: Array<{
      chatType: ChatType,
      buddyChatInfo: Array<{ category_name: string, peerUid: string, peerUin: string, remark: string; }>,
      discussChatInfo: [],
      groupChatInfo: Array<{
        groupCode: string,
        isConf: boolean,
        hasModifyConfGroupFace: boolean,
        hasModifyConfGroupName: boolean,
        groupName: string,
        remark: string;
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
      elemType: string,
      fileSize: string,
      filePath: string,
      fileName: string,
      hits: Array<{ start: number, end: number; }>;
    }>;
  }): Promise<{
    result: number,
    errMsg: string,
    id?: number;
  }>;

  removeSearchHistory (arg: unknown): unknown;

  addOrUpdateSearchMostUseItem (arg1: unknown, arg2: unknown): unknown;

  getSearchMostUseItem (arg: unknown): unknown;

  deleteSearchMostUseItem (arg: unknown): unknown;

  deleteGroupHistoryFile (arg: unknown): unknown;

  clearSearchCache (arg: unknown): unknown;

  clearSearchHistory (): unknown;

  loadSearchHistory (): unknown;

  initTokenizeUtil (): unknown;
}
