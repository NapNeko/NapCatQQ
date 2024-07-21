import { Peer } from "../entities";
import { NodeIKernelRecentContactListener } from "../listeners/NodeIKernelRecentContactListener";

export interface NodeIKernelRecentContactService {
    setGuildDisplayStatus(...args: unknown[]): unknown; // 2 arguments

    setContactListTop(...args: unknown[]): unknown; // 2 arguments

    updateRecentContactExtBufForUI(...args: unknown[]): unknown; // 2 arguments

    upsertRecentContactManually(...args: unknown[]): unknown; // 1 arguments

    enterOrExitMsgList(...args: unknown[]): unknown; // 1 arguments

    getRecentContactListSnapShot(...args: unknown[]): unknown; // 1 arguments

    clearMsgUnreadCount(...args: unknown[]): unknown; // 1 arguments

    getRecentContactListSyncLimit(count: number): unknown;

    jumpToSpecifyRecentContact(...args: unknown[]): unknown; // 1 arguments

    fetchAndSubscribeABatchOfRecentContact(...args: unknown[]): unknown; // 1 arguments

    addRecentContact(peer: Peer): unknown;

    deleteRecentContacts(peer: Peer): unknown; // 猜测

    getContacts(peers: Peer[]): Promise<unknown>;

    setThirdPartyBusinessInfos(...args: unknown[]): unknown; // 1 arguments

    updateGameMsgConfigs(...args: unknown[]): unknown; // 1 arguments

    removeKernelRecentContactListener(...args: unknown[]): unknown; // 1 arguments

    addKernelRecentContactListener(listener: NodeIKernelRecentContactListener): number;

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