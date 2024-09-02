import { ChatType, RawMessage } from '@/core/entities';
import { CommonFileInfo } from '@/core';

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
    commonFileInfo?: CommonFileInfo,
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
    item: Array<{
        peerId: string;
        type: number;
        folderInfo?: {
            folderId: string;
            parentFolderId: string;
            folderName: string;
            createTime: number;
            modifyTime: number;
            createUin: string;
            creatorName: string;
            totalFileCount: number;
            modifyUin: string;
            modifyName: string;
            usedSpace: string;
        },
        fileInfo?: {
            fileModelId: string;
            fileId: string;
            fileName: string;
            fileSize: string;
            busId: number;
            uploadedSize: string;
            uploadTime: number;
            deadTime: number;
            modifyTime: number;
            downloadTimes: number;
            sha: string;
            sha3: string;
            md5: string;
            uploaderLocalPath: string;
            uploaderName: string;
            uploaderUin: string;
            parentFolderId: string;
            localPath: string;
            transStatus: number;
            transType: number;
            elementId: string;
            isFolder: boolean;
        },
    }>;
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

export class NodeIKernelMsgListener {
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

    onRecvSysMsg(arrayList: Array<number>) {

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
