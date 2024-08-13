import {
    CacheFileListItem,
    CacheFileType,
    ChatCacheListItemBasic,
    ChatType,
    ElementType,
    IMAGE_HTTP_HOST,
    IMAGE_HTTP_HOST_NT,
    Peer,
    PicElement,
} from '@/core/entities';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { InstanceContext, NapCatCore, OnRichMediaDownloadCompleteParams } from '@/core';
import * as fileType from 'file-type';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { NodeIKernelSearchService } from '../services/NodeIKernelSearchService';
import { RkeyManager } from '../helper/rkey';
import { calculateFileMD5 } from '@/common/utils/file';


export class NTQQFileApi {
    context: InstanceContext;
    core: NapCatCore;
    rkeyManager: RkeyManager;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
        this.rkeyManager = new RkeyManager('http://napcat-sign.wumiao.wang:2082/rkey', this.context.logger);
    }

    async getFileType(filePath: string) {
        return fileType.fileTypeFromFile(filePath);
    }

    async copyFile(filePath: string, destPath: string) {
        await this.core.util.copyFile(filePath, destPath);
    }

    async getFileSize(filePath: string): Promise<number> {
        return await this.core.util.getFileSize(filePath);
    }

    async getVideoUrl(peer: Peer, msgId: string, elementId: string) {
        return (await this.context.session.getRichMediaService().getVideoPlayUrlV2(peer, msgId, elementId, 0, {
            downSourceType: 1,
            triggerType: 1,
        })).urlResult.domainUrl;
    }

    // 上传文件到QQ的文件夹
    async uploadFile(filePath: string, elementType: ElementType = ElementType.PIC, elementSubType: number = 0) {
        // napCatCore.wrapper.util.
        const fileMd5 = await calculateFileMD5(filePath);
        let ext: string = (await this.getFileType(filePath))?.ext as string || '';
        if (ext) {
            ext = '.' + ext;
        }
        let fileName = `${path.basename(filePath)}`;
        if (fileName.indexOf('.') === -1) {
            fileName += ext;
        }
        const mediaPath = this.context.session.getMsgService().getRichMediaFilePathForGuild({
            md5HexStr: fileMd5,
            fileName: fileName,
            elementType: elementType,
            elementSubType,
            thumbSize: 0,
            needCreate: true,
            downloadType: 1,
            file_uuid: '',
        });
        await this.copyFile(filePath, mediaPath!);
        const fileSize = await this.getFileSize(filePath);
        return {
            md5: fileMd5,
            fileName,
            path: mediaPath,
            fileSize,
            ext,
        };
    }

    async downloadMediaByUuid() {
        //napCatCore.session.getRichMediaService().downloadFileForFileUuid();
    }

    async downloadMedia(msgId: string, chatType: ChatType, peerUid: string, elementId: string, thumbPath: string, sourcePath: string, timeout = 1000 * 60 * 2, force: boolean = false) {
        //logDebug('receive downloadMedia task', msgId, chatType, peerUid, elementId, thumbPath, sourcePath, timeout, force);
        // 用于下载收到的消息中的图片等
        if (sourcePath && fs.existsSync(sourcePath)) {
            if (force) {
                try {
                    await fsPromises.unlink(sourcePath);
                } catch (e) {
                    //
                }
            } else {
                return sourcePath;
            }
        }
        const data = await this.core.eventWrapper.CallNormalEvent<
            (
                params: {
                    fileModelId: string,
                    downloadSourceType: number,
                    triggerType: number,
                    msgId: string,
                    chatType: ChatType,
                    peerUid: string,
                    elementId: string,
                    thumbSize: number,
                    downloadType: number,
                    filePath: string
                }) => Promise<unknown>,
            (fileTransNotifyInfo: OnRichMediaDownloadCompleteParams) => void
                >(
                'NodeIKernelMsgService/downloadRichMedia',
                'NodeIKernelMsgListener/onRichMediaDownloadComplete',
                1,
                timeout,
                (arg: OnRichMediaDownloadCompleteParams) => {
                    if (arg.msgId === msgId) {
                        return true;
                    }
                    return false;
                },
                {
                    fileModelId: '0',
                    downloadSourceType: 0,
                    triggerType: 1,
                    msgId: msgId,
                    chatType: chatType,
                    peerUid: peerUid,
                    elementId: elementId,
                    thumbSize: 0,
                    downloadType: 1,
                    filePath: thumbPath,
                },
                );
        const msg = await this.core.apis.MsgApi.getMsgsByMsgId({
            guildId: '',
            chatType: chatType,
            peerUid: peerUid,
        }, [msgId]);
        if (msg.msgList.length === 0) {
            return data[1].filePath;
        }
        //获取原始消息
        const FileElements = msg?.msgList[0]?.elements?.find(e => e.elementId === elementId);
        if (!FileElements) {
            //失败则就乱来 Todo
            return data[1].filePath;
        }
        //从原始消息获取文件路径
        const filePath =
            FileElements?.fileElement?.filePath ||
            FileElements?.pttElement?.filePath ||
            FileElements?.videoElement?.filePath ||
            FileElements?.picElement?.sourcePath;
        return filePath;
    }

    async getImageSize(filePath: string): Promise<ISizeCalculationResult | undefined> {
        return new Promise((resolve, reject) => {
            imageSize(filePath, (err, dimensions) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(dimensions);
                }
            });
        });
    }

    async addFileCache(peer: Peer, msgId: string, msgSeq: string, senderUid: string, elemId: string, elemType: string, fileSize: string, fileName: string) {
        let GroupData;
        let BuddyData;
        if (peer.chatType === ChatType.group) {
            GroupData =
                [{
                    groupCode: peer.peerUid,
                    isConf: false,
                    hasModifyConfGroupFace: true,
                    hasModifyConfGroupName: true,
                    groupName: 'NapCat.Cached',
                    remark: 'NapCat.Cached',
                }];
        } else if (peer.chatType === ChatType.friend) {
            BuddyData = [{
                category_name: 'NapCat.Cached',
                peerUid: peer.peerUid,
                peerUin: peer.peerUid,
                remark: 'NapCat.Cached',
            }];
        } else {
            return undefined;
        }

        return this.context.session.getSearchService().addSearchHistory({
            type: 4,
            contactList: [],
            id: -1,
            groupInfos: [],
            msgs: [],
            fileInfos: [
                {
                    chatType: peer.chatType,
                    buddyChatInfo: BuddyData || [],
                    discussChatInfo: [],
                    groupChatInfo: GroupData || [],
                    dataLineChatInfo: [],
                    tmpChatInfo: [],
                    msgId: msgId,
                    msgSeq: msgSeq,
                    msgTime: Math.floor(Date.now() / 1000).toString(),
                    senderUid: senderUid,
                    senderNick: 'NapCat.Cached',
                    senderRemark: 'NapCat.Cached',
                    senderCard: 'NapCat.Cached',
                    elemId: elemId,
                    elemType: elemType,
                    fileSize: fileSize,
                    filePath: '',
                    fileName: fileName,
                    hits: [{
                        start: 12,
                        end: 14,
                    }],
                },
            ],
        });
    }

    async searchfile(keys: string[]) {
        type EventType = NodeIKernelSearchService['searchFileWithKeywords'];

        interface OnListener {
            searchId: string,
            hasMore: boolean,
            resultItems: {
                chatType: ChatType,
                buddyChatInfo: any[],
                discussChatInfo: any[],
                groupChatInfo:
                {
                    groupCode: string,
                    isConf: boolean,
                    hasModifyConfGroupFace: boolean,
                    hasModifyConfGroupName: boolean,
                    groupName: string,
                    remark: string
                }[],
                dataLineChatInfo: any[],
                tmpChatInfo: any[],
                msgId: string,
                msgSeq: string,
                msgTime: string,
                senderUid: string,
                senderNick: string,
                senderRemark: string,
                senderCard: string,
                elemId: string,
                elemType: number,
                fileSize: string,
                filePath: string,
                fileName: string,
                hits:
                {
                    start: number,
                    end: number
                }[]
            }[]
        }

        const Event = this.core.eventWrapper.createEventFunction<EventType>('NodeIKernelSearchService/searchFileWithKeywords');
        let id = '';
        const Listener = this.core.eventWrapper.RegisterListen<(params: OnListener) => void>
            (
            'NodeIKernelSearchListener/onSearchFileKeywordsResult',
            1,
            20000,
            (params) => id !== '' && params.searchId == id,
            );
        id = await Event!(keys, 12);
        const [ret] = (await Listener);
        return ret;
    }

    async getImageUrl(element: PicElement) {
        if (!element) {
            return '';
        }
        const url: string = element.originImageUrl!;  // 没有域名
        const md5HexStr = element.md5HexStr;
        const fileMd5 = element.md5HexStr;
        const fileUuid = element.fileUuid;

        if (url) {
            const UrlParse = new URL(IMAGE_HTTP_HOST + url);//临时解析拼接
            const imageAppid = UrlParse.searchParams.get('appid');
            const isNewPic = imageAppid && ['1406', '1407'].includes(imageAppid);
            if (isNewPic) {
                let UrlRkey = UrlParse.searchParams.get('rkey');
                if (UrlRkey) {
                    return IMAGE_HTTP_HOST_NT + url;
                }
                const rkeyData = await this.rkeyManager.getRkey();
                UrlRkey = imageAppid === '1406' ? rkeyData.private_rkey : rkeyData.group_rkey;
                return IMAGE_HTTP_HOST_NT + url + `${UrlRkey}`;
            } else {
                // 老的图片url，不需要rkey
                return IMAGE_HTTP_HOST + url;
            }
        } else if (fileMd5 || md5HexStr) {
            // 没有url，需要自己拼接
            return `${IMAGE_HTTP_HOST}/gchatpic_new/0/0-0-${(fileMd5 || md5HexStr)!.toUpperCase()}/0`;
        }
        this.context.logger.logDebug('图片url获取失败', element);
        return '';
    }
}

export class NTQQFileCacheApi {
    context: InstanceContext;
    core: NapCatCore;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }

    async setCacheSilentScan(isSilent: boolean = true) {
        return '';
    }

    getCacheSessionPathList() {
        return '';
    }

    clearCache(cacheKeys: Array<string> = ['tmp', 'hotUpdate']) {
        // 参数未验证
        return this.context.session.getStorageCleanService().clearCacheDataByKeys(cacheKeys);
    }

    addCacheScannedPaths(pathMap: object = {}) {
        return this.context.session.getStorageCleanService().addCacheScanedPaths(pathMap);
    }

    scanCache() {
        //return (await this.context.session.getStorageCleanService().scanCache()).size;
    }

    getHotUpdateCachePath() {
        // 未实现
        return '';
    }

    getDesktopTmpPath() {
        // 未实现
        return '';
    }

    getChatCacheList(type: ChatType, pageSize: number = 1000, pageIndex: number = 0) {
        return this.context.session.getStorageCleanService().getChatCacheInfo(type, pageSize, 1, pageIndex);
    }

    getFileCacheInfo(fileType: CacheFileType, pageSize: number = 1000, lastRecord?: CacheFileListItem) {
        const _lastRecord = lastRecord ? lastRecord : { fileType: fileType };
        //需要五个参数
        //return napCatCore.session.getStorageCleanService().getFileCacheInfo();
    }

    async clearChatCache(chats: ChatCacheListItemBasic[] = [], fileKeys: string[] = []) {
        return this.context.session.getStorageCleanService().clearChatCacheInfo(chats, fileKeys);
    }
}
