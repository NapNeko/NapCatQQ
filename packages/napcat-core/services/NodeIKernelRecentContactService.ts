import { ChatType, Peer } from '@/napcat-core/types';
import { NodeIKernelRecentContactListener } from '@/napcat-core/listeners/NodeIKernelRecentContactListener';
import { GeneralCallResult } from '@/napcat-core/services/common';
import { FSABRecentContactParams } from '@/napcat-core/types/contact';

export interface NodeIKernelRecentContactService {
  setGuildDisplayStatus (arg1: unknown, arg2: unknown): unknown;

  setContactListTop (peer: Peer, isTop: boolean): unknown;

  updateRecentContactExtBufForUI (peer: Peer, extBuf: unknown): unknown;

  upsertRecentContactManually (arg: unknown): unknown;

  manageContactMergeWindow (arg: unknown): unknown;

  enterOrExitMsgList (arg: unknown): unknown;

  getRecentContactListSnapShot (count: number): Promise<GeneralCallResult & {
    info: {
      errCode: number,
      errMsg: string,
      sortedContactList: Array<number>,
      changedList: Array<{
        remark: unknown;
        peerName: unknown;
        sendMemberName: unknown;
        sendNickName: unknown;
        peerUid: string;
        peerUin: string,
        msgTime: string,
        chatType: ChatType,
        msgId: string;
      }>;
    };
  }>;

  clearMsgUnreadCount (peer: Peer): unknown;

  getRecentContactListSyncLimit (count: number): unknown;

  jumpToSpecifyRecentContact (arg: unknown): unknown;

  fetchAndSubscribeABatchOfRecentContact (params: FSABRecentContactParams): unknown;

  addRecentContact (peer: Peer): unknown;

  deleteRecentContacts (peer: Peer): unknown;

  getContacts (peers: Peer[]): Promise<unknown>;

  setThirdPartyBusinessInfos (arg: unknown): unknown;

  updateGameMsgConfigs (arg: unknown): unknown;

  removeKernelRecentContactListener (listenerId: number): unknown;

  addKernelRecentContactListener (listener: NodeIKernelRecentContactListener): void;

  clearRecentContactsByChatType (chatType: ChatType): unknown;

  upInsertModule (arg: unknown): unknown;

  jumpToSpecifyRecentContactVer2 (arg: unknown): unknown;

  deleteRecentContactsVer2 (arg: unknown): unknown;

  getRecentContactList (): Promise<unknown>;

  getMsgUnreadCount (): unknown;

  clearRecentContacts (): unknown;

  getServiceAssistantRecentContactInfos (): unknown;

  getRecentContactInfos (): unknown;

  getUnreadDetailsInfos (): unknown;

  cleanAllModule (): unknown;

  setAllGameMsgRead (): unknown;

  getRecentContactListSync (): unknown;
}
