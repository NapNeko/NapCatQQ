import { ChatType, KickedOffLineInfo, RawMessage } from '@/core/entities';
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
    userTotalSpacePerDay: unknown,
    userUsedSpacePerDay: unknown
}

export interface GroupFileInfoUpdateParamType {
    retCode: number;
    retMsg: string;
    clientWording: string;
    isEnd: boolean;
    item: Array<GroupFileInfoUpdateItem>;
    allFileCount: number;
    nextIndex: number;
    reqId: number;
}

// {
//   sessionType: 1,
//   chatType: 100,
//   peerUid: 'u_PVQ3tl6K78xxxx',
//   groupCode: '809079648',
//   fromNick: '拾xxxx,
//   sig: '0x'
// }

export interface GroupFileInfoUpdateItem {
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
}

export interface TempOnRecvParams {
    sessionType: number,//1
    chatType: ChatType,//100
    peerUid: string,//uid
    groupCode: string,//gc
    fromNick: string,//gc name
    sig: string,

}

export class NodeIKernelMsgListener {
    onAddSendMsg(msgRecord: RawMessage): any {

    }

    onBroadcastHelperDownloadComplete(broadcastHelperTransNotifyInfo: unknown): any {

    }

    onBroadcastHelperProgressUpdate(broadcastHelperTransNotifyInfo: unknown): any {

    }

    onChannelFreqLimitInfoUpdate(contact: unknown, z: unknown, freqLimitInfo: unknown): any {

    }

    onContactUnreadCntUpdate(hashMap: unknown): any {

    }

    onCustomWithdrawConfigUpdate(customWithdrawConfig: unknown): any {

    }

    onDraftUpdate(contact: unknown, arrayList: unknown, j2: unknown): any {

    }

    onEmojiDownloadComplete(emojiNotifyInfo: unknown): any {

    }

    onEmojiResourceUpdate(emojiResourceInfo: unknown): any {

    }

    onFeedEventUpdate(firstViewDirectMsgNotifyInfo: unknown): any {

    }

    onFileMsgCome(arrayList: unknown): any {

    }

    onFirstViewDirectMsgUpdate(firstViewDirectMsgNotifyInfo: unknown): any {

    }

    onFirstViewGroupGuildMapping(arrayList: unknown): any {

    }

    onGrabPasswordRedBag(i2: unknown, str: unknown, i3: unknown, recvdOrder: unknown, msgRecord: unknown): any {

    }

    onGroupFileInfoAdd(groupItem: unknown): any {

    }

    onGroupFileInfoUpdate(groupFileListResult: GroupFileInfoUpdateParamType): any {

    }

    onGroupGuildUpdate(groupGuildNotifyInfo: unknown): any {

    }


    onGroupTransferInfoAdd(groupItem: unknown): any {

    }

    onGroupTransferInfoUpdate(groupFileListResult: unknown): any {

    }

    onGuildInteractiveUpdate(guildInteractiveNotificationItem: unknown): any {

    }

    onGuildMsgAbFlagChanged(guildMsgAbFlag: unknown): any {

    }

    onGuildNotificationAbstractUpdate(guildNotificationAbstractInfo: unknown): any {

    }

    onHitCsRelatedEmojiResult(downloadRelateEmojiResultInfo: unknown): any {

    }

    onHitEmojiKeywordResult(hitRelatedEmojiWordsResult: unknown): any {

    }

    onHitRelatedEmojiResult(relatedWordEmojiInfo: unknown): any {

    }

    onImportOldDbProgressUpdate(importOldDbMsgNotifyInfo: unknown): any {

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
    }): any {

    }

    onKickedOffLine(kickedInfo: KickedOffLineInfo): any {

    }

    onLineDev(arrayList: unknown): any {

    }

    onLogLevelChanged(j2: unknown): any {

    }

    onMsgAbstractUpdate(arrayList: unknown): any {

    }

    onMsgBoxChanged(arrayList: unknown): any {

    }

    onMsgDelete(contact: unknown, arrayList: unknown): any {

    }

    onMsgEventListUpdate(hashMap: unknown): any {

    }

    onMsgInfoListAdd(arrayList: unknown): any {

    }

    onMsgInfoListUpdate(msgList: RawMessage[]): any {

    }

    onMsgQRCodeStatusChanged(i2: unknown): any {

    }

    onMsgRecall(i2: unknown, str: unknown, j2: unknown): any {

    }

    onMsgSecurityNotify(msgRecord: unknown): any {

    }

    onMsgSettingUpdate(msgSetting: unknown): any {

    }

    onNtFirstViewMsgSyncEnd(): any {

    }

    onNtMsgSyncEnd(): any {

    }

    onNtMsgSyncStart(): any {

    }

    onReadFeedEventUpdate(firstViewDirectMsgNotifyInfo: unknown): any {

    }

    onRecvGroupGuildFlag(i2: unknown): any {

    }

    onRecvMsg(arrayList: RawMessage[]): any {

    }

    onRecvMsgSvrRspTransInfo(j2: unknown, contact: unknown, i2: unknown, i3: unknown, str: unknown, bArr: unknown): any {

    }

    onRecvOnlineFileMsg(arrayList: unknown): any {

    }

    onRecvS2CMsg(arrayList: unknown): any {

    }

    onRecvSysMsg(arrayList: Array<number>): any {

    }

    onRecvUDCFlag(i2: unknown): any {

    }

    onRichMediaDownloadComplete(fileTransNotifyInfo: OnRichMediaDownloadCompleteParams): any {
    }

    onRichMediaProgerssUpdate(fileTransNotifyInfo: unknown): any {

    }

    onRichMediaUploadComplete(fileTransNotifyInfo: unknown): any {

    }

    onSearchGroupFileInfoUpdate(searchGroupFileResult: unknown): any {

    }

    onSendMsgError(j2: unknown, contact: unknown, i2: unknown, str: unknown): any {

    }

    onSysMsgNotification(i2: unknown, j2: unknown, j3: unknown, arrayList: unknown): any {

    }

    onTempChatInfoUpdate(tempChatInfo: TempOnRecvParams): any {

    }

    onUnreadCntAfterFirstView(hashMap: unknown): any {

    }

    onUnreadCntUpdate(hashMap: unknown): any {

    }

    onUserChannelTabStatusChanged(z: unknown): any {

    }

    onUserOnlineStatusChanged(z: unknown): any {

    }

    onUserTabStatusChanged(arrayList: unknown): any {

    }

    onlineStatusBigIconDownloadPush(i2: unknown, j2: unknown, str: unknown): any {

    }

    onlineStatusSmallIconDownloadPush(i2: unknown, j2: unknown, str: unknown): any {

    }

    // 第一次发现于Linux
    onUserSecQualityChanged(...args: unknown[]): any {

    }

    onMsgWithRichLinkInfoUpdate(...args: unknown[]): any {

    }

    onRedTouchChanged(...args: unknown[]): any {

    }

    // 第一次发现于Win 9.9.9-23159
    onBroadcastHelperProgerssUpdate(...args: unknown[]): any {

    }
}
