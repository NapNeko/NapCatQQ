import { ChatType, KickedOffLineInfo, RawMessage } from '@/core/types';
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
    userUsedSpacePerDay: unknown,
    chatType: number,
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
    onAddSendMsg(_msgRecord: RawMessage): any {

    }

    onBroadcastHelperDownloadComplete(_broadcastHelperTransNotifyInfo: unknown): any {

    }

    onBroadcastHelperProgressUpdate(_broadcastHelperTransNotifyInfo: unknown): any {

    }

    onChannelFreqLimitInfoUpdate(_contact: unknown, _z: unknown, _freqLimitInfo: unknown): any {

    }

    onContactUnreadCntUpdate(_hashMap: unknown): any {

    }

    onCustomWithdrawConfigUpdate(_customWithdrawConfig: unknown): any {

    }

    onDraftUpdate(_contact: unknown, _arrayList: unknown, _j2: unknown): any {

    }

    onEmojiDownloadComplete(_emojiNotifyInfo: unknown): any {

    }

    onEmojiResourceUpdate(_emojiResourceInfo: unknown): any {

    }

    onFeedEventUpdate(_firstViewDirectMsgNotifyInfo: unknown): any {

    }

    onFileMsgCome(_arrayList: unknown): any {

    }

    onFirstViewDirectMsgUpdate(_firstViewDirectMsgNotifyInfo: unknown): any {

    }

    onFirstViewGroupGuildMapping(_arrayList: unknown): any {

    }

    onGrabPasswordRedBag(_i2: unknown, _str: unknown, _i3: unknown, _recvdOrder: unknown, _msgRecord: unknown): any {

    }

    onGroupFileInfoAdd(_groupItem: unknown): any {

    }

    onGroupFileInfoUpdate(_groupFileListResult: GroupFileInfoUpdateParamType): any {

    }

    onGroupGuildUpdate(_groupGuildNotifyInfo: unknown): any {

    }


    onGroupTransferInfoAdd(_groupItem: unknown): any {

    }

    onGroupTransferInfoUpdate(_groupFileListResult: unknown): any {

    }

    onGuildInteractiveUpdate(_guildInteractiveNotificationItem: unknown): any {

    }

    onGuildMsgAbFlagChanged(_guildMsgAbFlag: unknown): any {

    }

    onGuildNotificationAbstractUpdate(_guildNotificationAbstractInfo: unknown): any {

    }

    onHitCsRelatedEmojiResult(_downloadRelateEmojiResultInfo: unknown): any {

    }

    onHitEmojiKeywordResult(_hitRelatedEmojiWordsResult: unknown): any {

    }

    onHitRelatedEmojiResult(_relatedWordEmojiInfo: unknown): any {

    }

    onImportOldDbProgressUpdate(_importOldDbMsgNotifyInfo: unknown): any {

    }

    onInputStatusPush(_inputStatusInfo: {
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

    onKickedOffLine(_kickedInfo: KickedOffLineInfo): any {

    }

    onLineDev(_arrayList: unknown): any {

    }

    onLogLevelChanged(_j2: unknown): any {

    }

    onMsgAbstractUpdate(_arrayList: unknown): any {

    }

    onMsgBoxChanged(_arrayList: unknown): any {

    }

    onMsgDelete(_contact: unknown, _arrayList: unknown): any {

    }

    onMsgEventListUpdate(_hashMap: unknown): any {

    }

    onMsgInfoListAdd(_arrayList: unknown): any {

    }

    onMsgInfoListUpdate(_msgList: RawMessage[]): any {

    }

    onMsgQRCodeStatusChanged(_i2: unknown): any {

    }

    onMsgRecall(_chatType: ChatType, _uid: string, _msgSeq: string): any {

    }

    onMsgSecurityNotify(_msgRecord: unknown): any {

    }

    onMsgSettingUpdate(_msgSetting: unknown): any {

    }

    onNtFirstViewMsgSyncEnd(): any {

    }

    onNtMsgSyncEnd(): any {

    }

    onNtMsgSyncStart(): any {

    }

    onReadFeedEventUpdate(_firstViewDirectMsgNotifyInfo: unknown): any {

    }

    onRecvGroupGuildFlag(_i2: unknown): any {

    }

    onRecvMsg(_arrayList: RawMessage[]): any {

    }

    onRecvMsgSvrRspTransInfo(_j2: unknown, _contact: unknown, _i2: unknown, _i3: unknown, _str: unknown, _bArr: unknown): any {

    }

    onRecvOnlineFileMsg(_arrayList: unknown): any {

    }

    onRecvS2CMsg(_arrayList: unknown): any {

    }

    onRecvSysMsg(_arrayList: Array<number>): any {

    }

    onRecvUDCFlag(_i2: unknown): any {

    }

    onRichMediaDownloadComplete(_fileTransNotifyInfo: OnRichMediaDownloadCompleteParams): any {
    }

    onRichMediaProgerssUpdate(_fileTransNotifyInfo: unknown): any {

    }

    onRichMediaUploadComplete(_fileTransNotifyInfo: unknown): any {

    }

    onSearchGroupFileInfoUpdate(_searchGroupFileResult: unknown): any {

    }

    onSendMsgError(_j2: unknown, _contact: unknown, _i2: unknown, _str: unknown): any {

    }

    onSysMsgNotification(_i2: unknown, _j2: unknown, _j3: unknown, _arrayList: unknown): any {

    }

    onTempChatInfoUpdate(_tempChatInfo: TempOnRecvParams): any {

    }

    onUnreadCntAfterFirstView(_hashMap: unknown): any {

    }

    onUnreadCntUpdate(_hashMap: unknown): any {

    }

    onUserChannelTabStatusChanged(_z: unknown): any {

    }

    onUserOnlineStatusChanged(_z: unknown): any {

    }

    onUserTabStatusChanged(_arrayList: unknown): any {

    }

    onlineStatusBigIconDownloadPush(_i2: unknown, _j2: unknown, _str: unknown): any {

    }

    onlineStatusSmallIconDownloadPush(_i2: unknown, _j2: unknown, _str: unknown): any {

    }

    // 第一次发现于Linux
    onUserSecQualityChanged(..._args: unknown[]): any {

    }

    onMsgWithRichLinkInfoUpdate(..._args: unknown[]): any {

    }

    onRedTouchChanged(..._args: unknown[]): any {

    }

    // 第一次发现于Win 9.9.9-23159
    onBroadcastHelperProgerssUpdate(..._args: unknown[]): any {

    }
}
