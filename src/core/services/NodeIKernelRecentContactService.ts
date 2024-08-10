import { ChatType, Peer } from '../entities';
import { NodeIKernelRecentContactListener } from '../listeners/NodeIKernelRecentContactListener';
import { GeneralCallResult } from './common';

export interface FSABRecentContactParams {
    anchorPointContact: {
        contactId: string;
        sortField: string;
        pos: number;
    },
    relativeMoveCount: number;
    listType: number;
    count: number;
    fetchOld: boolean;
}

// {
//     "anchorPointContact": {
//       "contactId": "",
//       "sortField": "",
//       "pos": 0
//     },
//     "relativeMoveCount": 0,
//     "listType": 1,
//     "count": 200,
//     "fetchOld": true
//   }
export interface NodeIKernelRecentContactService {
    setGuildDisplayStatus(...args: unknown[]): unknown; // 2 arguments

    setContactListTop(...args: unknown[]): unknown; // 2 arguments

    updateRecentContactExtBufForUI(...args: unknown[]): unknown; // 2 arguments

    upsertRecentContactManually(...args: unknown[]): unknown; // 1 arguments

    enterOrExitMsgList(...args: unknown[]): unknown; // 1 arguments

    /*!---!*/
    getRecentContactListSnapShot(count: number): Promise<GeneralCallResult & {
        info: {
            errCode: number,
            errMsg: string,
            sortedContactList: Array<number>,
            changedList: Array<{
                remark: any;
                peerName: any;
                sendMemberName: any;
                sendNickName: any;
                peerUid: string; peerUin: string, msgTime: string, chatType: ChatType, msgId: string
            }>
        }
    }>; // 1 arguments

    clearMsgUnreadCount(...args: unknown[]): unknown; // 1 arguments

    getRecentContactListSyncLimit(count: number): unknown;

    jumpToSpecifyRecentContact(...args: unknown[]): unknown; // 1 arguments

    /*!---!*/
    fetchAndSubscribeABatchOfRecentContact(params: FSABRecentContactParams): unknown; // 1 arguments

    addRecentContact(peer: Peer): unknown;

    deleteRecentContacts(peer: Peer): unknown; // 猜测

    getContacts(peers: Peer[]): Promise<unknown>;

    setThirdPartyBusinessInfos(...args: unknown[]): unknown; // 1 arguments

    updateGameMsgConfigs(...args: unknown[]): unknown; // 1 arguments

    removeKernelRecentContactListener(listenerid: number): unknown; // 1 arguments

    addKernelRecentContactListener(listener: NodeIKernelRecentContactListener): void;

    clearRecentContactsByChatType(...args: unknown[]): unknown; // 1 arguments

    upInsertModule(...args: unknown[]): unknown; // 1 arguments

    jumpToSpecifyRecentContactVer2(...args: unknown[]): unknown; // 1 arguments

    deleteRecentContactsVer2(...args: unknown[]): unknown; // 1 arguments

    getRecentContactList(): Promise<any>;

    getMsgUnreadCount(): unknown;

    clearRecentContacts(): unknown;

    getServiceAssistantRecentContactInfos(): unknown;

    getRecentContactInfos(): unknown;

    getUnreadDetailsInfos(): unknown;

    cleanAllModule(): unknown;

    setAllGameMsgRead(): unknown;

    getRecentContactListSync(): unknown;
}
