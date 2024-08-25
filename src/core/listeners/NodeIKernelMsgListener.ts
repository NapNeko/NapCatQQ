import { ChatType, RawMessage } from '@/core/entities';

export interface OnRichMediaDownloadCompleteParams {
    fileModelId: string,
    msgElementId: string,
    msgId: string,
    fileId: string,
    fileProgress: string, // '0'
    fileSpeed: string, // '0'
    fileErrCode: string,  // '0'
    fileErrMsg: string,
    fileDownType: number,  // 暂时未知
    thumbSize: number,
    filePath: string,
    totalSize: string,
    trasferStatus: number,
    step: number,
    commonFileInfo: unknown | null,
    fileSrvErrCode: string,
    clientMsg: string,
    businessId: number,
    userTotalSpacePerDay: unknown | null,
    userUsedSpacePerDay: unknown | null
}

export interface GroupFileInfoUpdateParamType {
    retCode: number;
    retMsg: string;
    clientWording: string;
    isEnd: boolean;
    item: Array<any>;
    allFileCount: string;
    nextIndex: string;
    reqId: string;
}

// {
//   sessionType: 1,
//   chatType: 100,
//   peerUid: 'u_PVQ3tl6K78xxxx',
//   groupCode: '809079648',
//   fromNick: '拾xxxx,
//   sig: '0x'
// }
export interface TempOnRecvParams {
    sessionType: number,//1
    chatType: ChatType,//100
    peerUid: string,//uid
    groupCode: string,//gc
    fromNick: string,//gc name
    sig: string,

}

export interface IKernelMsgListener {
    onAddSendMsg(msgRecord: RawMessage): void;

    onBroadcastHelperDownloadComplete(broadcastHelperTransNotifyInfo: unknown): void;

    onBroadcastHelperProgressUpdate(broadcastHelperTransNotifyInfo: unknown): void;

    onChannelFreqLimitInfoUpdate(contact: unknown, z: unknown, freqLimitInfo: unknown): void;

    onContactUnreadCntUpdate(hashMap: unknown): void;

    onCustomWithdrawConfigUpdate(customWithdrawConfig: unknown): void;

    onDraftUpdate(contact: unknown, arrayList: unknown, j2: unknown): void;

    onEmojiDownloadComplete(emojiNotifyInfo: unknown): void;

    onEmojiResourceUpdate(emojiResourceInfo: unknown): void;

    onFeedEventUpdate(firstViewDirectMsgNotifyInfo: unknown): void;

    onFileMsgCome(arrayList: unknown): void;

    onFirstViewDirectMsgUpdate(firstViewDirectMsgNotifyInfo: unknown): void;

    onFirstViewGroupGuildMapping(arrayList: unknown): void;

    onGrabPasswordRedBag(i2: unknown, str: unknown, i3: unknown, recvdOrder: unknown, msgRecord: unknown): void;

    onGroupFileInfoAdd(groupItem: unknown): void;

    onGroupFileInfoUpdate(groupFileListResult: GroupFileInfoUpdateParamType): void;

    onGroupGuildUpdate(groupGuildNotifyInfo: unknown): void;

    onGroupTransferInfoAdd(groupItem: unknown): void;

    onGroupTransferInfoUpdate(groupFileListResult: unknown): void;

    onGuildInteractiveUpdate(guildInteractiveNotificationItem: unknown): void;

    onGuildMsgAbFlagChanged(guildMsgAbFlag: unknown): void;

    onGuildNotificationAbstractUpdate(guildNotificationAbstractInfo: unknown): void;

    onHitCsRelatedEmojiResult(downloadRelateEmojiResultInfo: unknown): void;

    onHitEmojiKeywordResult(hitRelatedEmojiWordsResult: unknown): void;

    onHitRelatedEmojiResult(relatedWordEmojiInfo: unknown): void;

    onImportOldDbProgressUpdate(importOldDbMsgNotifyInfo: unknown): void;

    onInputStatusPush(inputStatusInfo: {
        chatType: number;
        eventType: number;
        fromUin: string;
        interval: string;
        showTime: string;
        statusText: string;
        timestamp: string;
        toUin: string;
    }): void;

    onKickedOffLine(kickedInfo: unknown): void;

    onLineDev(arrayList: unknown): void;

    onLogLevelChanged(j2: unknown): void;

    onMsgAbstractUpdate(arrayList: unknown): void;

    onMsgBoxChanged(arrayList: unknown): void;

    onMsgDelete(contact: unknown, arrayList: unknown): void;

    onMsgEventListUpdate(hashMap: unknown): void;

    onMsgInfoListAdd(arrayList: unknown): void;

    onMsgInfoListUpdate(msgList: RawMessage[]): void;

    onMsgQRCodeStatusChanged(i2: unknown): void;

    onMsgRecall(i2: unknown, str: unknown, j2: unknown): void;

    onMsgSecurityNotify(msgRecord: unknown): void;

    onMsgSettingUpdate(msgSetting: unknown): void;

    onNtFirstViewMsgSyncEnd(): void;

    onNtMsgSyncEnd(): void;

    onNtMsgSyncStart(): void;

    onReadFeedEventUpdate(firstViewDirectMsgNotifyInfo: unknown): void;

    onRecvGroupGuildFlag(i2: unknown): void;

    onRecvMsg(...arrayList: unknown[]): void;

    onRecvMsgSvrRspTransInfo(j2: unknown, contact: unknown, i2: unknown, i3: unknown, str: unknown, bArr: unknown): void;

    onRecvOnlineFileMsg(arrayList: unknown): void;

    onRecvS2CMsg(arrayList: unknown): void;

    onRecvSysMsg(arrayList: unknown): void;

    onRecvUDCFlag(i2: unknown): void;

    onRichMediaDownloadComplete(fileTransNotifyInfo: OnRichMediaDownloadCompleteParams): void;

    onRichMediaProgerssUpdate(fileTransNotifyInfo: unknown): void;

    onRichMediaUploadComplete(fileTransNotifyInfo: unknown): void;

    onSearchGroupFileInfoUpdate(searchGroupFileResult:
                                    {
                                        result: {
                                            retCode: number,
                                            retMsg: string,
                                            clientWording: string
                                        },
                                        syncCookie: string,
                                        totalMatchCount: number,
                                        ownerMatchCount: number,
                                        isEnd: boolean,
                                        reqId: number,
                                        item: Array<{
                                            groupCode: string,
                                            groupName: string,
                                            uploaderUin: string,
                                            uploaderName: string,
                                            matchUin: string,
                                            matchWords: Array<unknown>,
                                            fileNameHits: Array<{
                                                start: number,
                                                end: number
                                            }>,
                                            fileModelId: string,
                                            fileId: string,
                                            fileName: string,
                                            fileSize: string,
                                            busId: number,
                                            uploadTime: number,
                                            modifyTime: number,
                                            deadTime: number,
                                            downloadTimes: number,
                                            localPath: string
                                        }>
                                    }): void;

    onSendMsgError(j2: unknown, contact: unknown, i2: unknown, str: unknown): void;

    onSysMsgNotification(i2: unknown, j2: unknown, j3: unknown, arrayList: unknown): void;

    onTempChatInfoUpdate(tempChatInfo: TempOnRecvParams): void;

    onUnreadCntAfterFirstView(hashMap: unknown): void;

    onUnreadCntUpdate(hashMap: unknown): void;

    onUserChannelTabStatusChanged(z: unknown): void;

    onUserOnlineStatusChanged(z: unknown): void;

    onUserTabStatusChanged(arrayList: unknown): void;

    onlineStatusBigIconDownloadPush(i2: unknown, j2: unknown, str: unknown): void;

    onlineStatusSmallIconDownloadPush(i2: unknown, j2: unknown, str: unknown): void;

    // 第一次发现于Linux
    onUserSecQualityChanged(...args: unknown[]): void;

    onMsgWithRichLinkInfoUpdate(...args: unknown[]): void;

    onRedTouchChanged(...args: unknown[]): void;

    // 第一次发现于Win 9.9.9 23159
    onBroadcastHelperProgerssUpdate(...args: unknown[]): void;

}

export interface NodeIKernelMsgListener extends IKernelMsgListener {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(listener: IKernelMsgListener): NodeIKernelMsgListener;
}


export class MsgListener implements IKernelMsgListener {
    onAddSendMsg(msgRecord: RawMessage) {

    }

    onBroadcastHelperDownloadComplete(broadcastHelperTransNotifyInfo: unknown) {

    }

    onBroadcastHelperProgressUpdate(broadcastHelperTransNotifyInfo: unknown) {

    }

    onChannelFreqLimitInfoUpdate(contact: unknown, z: unknown, freqLimitInfo: unknown) {

    }

    onContactUnreadCntUpdate(hashMap: unknown) {

    }

    onCustomWithdrawConfigUpdate(customWithdrawConfig: unknown) {

    }

    onDraftUpdate(contact: unknown, arrayList: unknown, j2: unknown) {

    }

    onEmojiDownloadComplete(emojiNotifyInfo: unknown) {

    }

    onEmojiResourceUpdate(emojiResourceInfo: unknown) {

    }

    onFeedEventUpdate(firstViewDirectMsgNotifyInfo: unknown) {

    }

    onFileMsgCome(arrayList: unknown) {

    }

    onFirstViewDirectMsgUpdate(firstViewDirectMsgNotifyInfo: unknown) {

    }

    onFirstViewGroupGuildMapping(arrayList: unknown) {

    }

    onGrabPasswordRedBag(i2: unknown, str: unknown, i3: unknown, recvdOrder: unknown, msgRecord: unknown) {

    }

    onGroupFileInfoAdd(groupItem: unknown) {

    }

    onGroupFileInfoUpdate(groupFileListResult: GroupFileInfoUpdateParamType) {

    }

    onGroupGuildUpdate(groupGuildNotifyInfo: unknown) {

    }


    onGroupTransferInfoAdd(groupItem: unknown) {

    }

    onGroupTransferInfoUpdate(groupFileListResult: unknown) {

    }

    onGuildInteractiveUpdate(guildInteractiveNotificationItem: unknown) {

    }

    onGuildMsgAbFlagChanged(guildMsgAbFlag: unknown) {

    }

    onGuildNotificationAbstractUpdate(guildNotificationAbstractInfo: unknown) {

    }

    onHitCsRelatedEmojiResult(downloadRelateEmojiResultInfo: unknown) {

    }

    onHitEmojiKeywordResult(hitRelatedEmojiWordsResult: unknown) {

    }

    onHitRelatedEmojiResult(relatedWordEmojiInfo: unknown) {

    }

    onImportOldDbProgressUpdate(importOldDbMsgNotifyInfo: unknown) {

    }

    onInputStatusPush(inputStatusInfo: {
        chatType: number;
        eventType: number;
        fromUin: string;
        interval: string;
        showTime: string;
        statusText: string;
        timestamp: string;
        toUin: string;
    }) {

    }

    onKickedOffLine(kickedInfo: unknown) {

    }

    onLineDev(arrayList: unknown) {

    }

    onLogLevelChanged(j2: unknown) {

    }

    onMsgAbstractUpdate(arrayList: unknown) {

    }

    onMsgBoxChanged(arrayList: unknown) {

    }

    onMsgDelete(contact: unknown, arrayList: unknown) {

    }

    onMsgEventListUpdate(hashMap: unknown) {

    }

    onMsgInfoListAdd(arrayList: unknown) {

    }

    onMsgInfoListUpdate(msgList: RawMessage[]) {

    }

    onMsgQRCodeStatusChanged(i2: unknown) {

    }

    onMsgRecall(i2: unknown, str: unknown, j2: unknown) {

    }

    onMsgSecurityNotify(msgRecord: unknown) {

    }

    onMsgSettingUpdate(msgSetting: unknown) {

    }

    onNtFirstViewMsgSyncEnd() {

    }

    onNtMsgSyncEnd() {

    }

    onNtMsgSyncStart() {

    }

    onReadFeedEventUpdate(firstViewDirectMsgNotifyInfo: unknown) {

    }

    onRecvGroupGuildFlag(i2: unknown) {

    }

    onRecvMsg(arrayList: RawMessage[]) {

    }

    onRecvMsgSvrRspTransInfo(j2: unknown, contact: unknown, i2: unknown, i3: unknown, str: unknown, bArr: unknown) {

    }

    onRecvOnlineFileMsg(arrayList: unknown) {

    }

    onRecvS2CMsg(arrayList: unknown) {

    }

    onRecvSysMsg(arrayList: unknown) {

    }

    onRecvUDCFlag(i2: unknown) {

    }

    onRichMediaDownloadComplete(fileTransNotifyInfo: OnRichMediaDownloadCompleteParams) {
    }

    onRichMediaProgerssUpdate(fileTransNotifyInfo: unknown) {

    }

    onRichMediaUploadComplete(fileTransNotifyInfo: unknown) {

    }

    onSearchGroupFileInfoUpdate(searchGroupFileResult: unknown) {

    }

    onSendMsgError(j2: unknown, contact: unknown, i2: unknown, str: unknown) {

    }

    onSysMsgNotification(i2: unknown, j2: unknown, j3: unknown, arrayList: unknown) {

    }

    onTempChatInfoUpdate(tempChatInfo: TempOnRecvParams) {

    }

    onUnreadCntAfterFirstView(hashMap: unknown) {

    }

    onUnreadCntUpdate(hashMap: unknown) {

    }

    onUserChannelTabStatusChanged(z: unknown) {

    }

    onUserOnlineStatusChanged(z: unknown) {

    }

    onUserTabStatusChanged(arrayList: unknown) {

    }

    onlineStatusBigIconDownloadPush(i2: unknown, j2: unknown, str: unknown) {

    }

    onlineStatusSmallIconDownloadPush(i2: unknown, j2: unknown, str: unknown) {

    }

    // 第一次发现于Linux
    onUserSecQualityChanged(...args: unknown[]) {

    }

    onMsgWithRichLinkInfoUpdate(...args: unknown[]) {

    }

    onRedTouchChanged(...args: unknown[]) {

    }

    // 第一次发现于Win 9.9.9-23159
    onBroadcastHelperProgerssUpdate(...args: unknown[]) {

    }
}
