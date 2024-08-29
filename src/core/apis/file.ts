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
    PicType,
    SendFileElement,
    SendPicElement,
    SendPttElement,
    SendVideoElement,
} from '@/core/entities';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { InstanceContext, NapCatCore } from '@/core';
import * as fileType from 'file-type';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { RkeyManager } from '../helper/rkey';
import { calculateFileMD5, isGIF } from '@/common/file';
import pathLib from 'node:path';
import { defaultVideoThumbB64, getVideoInfo } from '@/common/video';
import ffmpeg from 'fluent-ffmpeg';
import fsnormal from 'node:fs';
import { encodeSilk } from '@/common/audio';


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

    async createValidSendFileElement(
        filePath: string,
        fileName: string = '',
        folderId: string = '',
    ): Promise<SendFileElement> {
        const {
            fileName: _fileName,
            path,
            fileSize,
        } = await this.core.apis.FileApi.uploadFile(filePath, ElementType.FILE);
        if (fileSize === 0) {
            throw new Error('文件异常，大小为0');
        }
        return {
            elementType: ElementType.FILE,
            elementId: '',
            fileElement: {
                fileName: fileName || _fileName,
                folderId: folderId,
                filePath: path,
                fileSize: (fileSize).toString(),
            },
        };
    }

    async createValidSendPicElement(
        picPath: string,
        summary: string = '',
        subType: 0 | 1 = 0,
    ): Promise<SendPicElement> {
        const {
            md5,
            fileName,
            path,
            fileSize,
        } = await this.core.apis.FileApi.uploadFile(picPath, ElementType.PIC, subType);
        if (fileSize === 0) {
            throw new Error('文件异常，大小为0');
        }
        const imageSize = await this.core.apis.FileApi.getImageSize(picPath);
        const picElement: any = {
            md5HexStr: md5,
            fileSize: fileSize.toString(),
            picWidth: imageSize?.width,
            picHeight: imageSize?.height,
            fileName: fileName,
            sourcePath: path,
            original: true,
            picType: isGIF(picPath) ? PicType.gif : PicType.jpg,
            picSubType: subType,
            fileUuid: '',
            fileSubId: '',
            thumbFileSize: 0,
            summary,
        };
        return {
            elementType: ElementType.PIC,
            elementId: '',
            picElement,
        };
    }

    async createValidSendVideoElement(
        filePath: string,
        fileName: string = '',
        diyThumbPath: string = '',
    ): Promise<SendVideoElement> {
        const logger = this.core.context.logger;
        const {
            fileName: _fileName,
            path,
            fileSize,
            md5,
        } = await this.core.apis.FileApi.uploadFile(filePath, ElementType.VIDEO);
        if (fileSize === 0) {
            throw new Error('文件异常，大小为0');
        }
        let thumb = path.replace(`${pathLib.sep}Ori${pathLib.sep}`, `${pathLib.sep}Thumb${pathLib.sep}`);
        thumb = pathLib.dirname(thumb);
        let videoInfo = {
            width: 1920, height: 1080,
            time: 15,
            format: 'mp4',
            size: fileSize,
            filePath,
        };
        try {
            videoInfo = await getVideoInfo(path, logger);
        } catch (e) {
            logger.logError('获取视频信息失败', e);
        }
        const createThumb = new Promise<string | undefined>((resolve, reject) => {
            const thumbFileName = `${md5}_0.png`;
            const thumbPath = pathLib.join(thumb, thumbFileName);
            ffmpeg(filePath)
                .on('error', (err) => {
                    logger.logDebug('获取视频封面失败，使用默认封面', err);
                    if (diyThumbPath) {
                        fsPromises.copyFile(diyThumbPath, thumbPath).then(() => {
                            resolve(thumbPath);
                        }).catch(reject);
                    } else {
                        fsnormal.writeFileSync(thumbPath, Buffer.from(defaultVideoThumbB64, 'base64'));
                        resolve(thumbPath);
                    }
                })
                .screenshots({
                    timestamps: [0],
                    filename: thumbFileName,
                    folder: thumb,
                    size: videoInfo.width + 'x' + videoInfo.height,
                }).on('end', () => {
                    resolve(thumbPath);
                });
        });
        const thumbPath = new Map();
        const _thumbPath = await createThumb;
        const thumbSize = _thumbPath ? (await fsPromises.stat(_thumbPath)).size : 0;
        // log("生成缩略图", _thumbPath)
        thumbPath.set(0, _thumbPath);
        const thumbMd5 = _thumbPath ? await calculateFileMD5(_thumbPath) : '';
        // "fileElement": {
        //     "fileMd5": "",
        //     "fileName": "1.mp4",
        //     "filePath": "C:\\Users\\nanae\\OneDrive\\Desktop\\1.mp4",
        //     "fileSize": "1847007",
        //     "picHeight": 1280,
        //     "picWidth": 720,
        //     "picThumbPath": {},
        //     "file10MMd5": "",
        //     "fileSha": "",
        //     "fileSha3": "",
        //     "fileUuid": "",
        //     "fileSubId": "",
        //     "thumbFileSize": 750
        // }
        return {
            elementType: ElementType.VIDEO,
            elementId: '',
            videoElement: {
                fileName: fileName || _fileName,
                filePath: path,
                videoMd5: md5,
                thumbMd5,
                fileTime: videoInfo.time,
                thumbPath: thumbPath,
                thumbSize,
                thumbWidth: videoInfo.width,
                thumbHeight: videoInfo.height,
                fileSize: '' + fileSize,
                // fileFormat: videotype
                // fileUuid: "",
                // transferStatus: 0,
                // progress: 0,
                // invalidState: 0,
                // fileSubId: "",
                // fileBizId: null,
                // originVideoMd5: "",
                // fileFormat: 2,
                // import_rich_media_context: null,
                // sourceVideoCodecFormat: 2
            },
        };
    }

    async createValidSendPttElement(pttPath: string): Promise<SendPttElement> {
        const {
            converted,
            path: silkPath,
            duration,
        } = await encodeSilk(pttPath, this.core.NapCatTempPath, this.core.context.logger);
        // 生成语音 Path: silkPath Time: duration
        if (!silkPath) {
            throw new Error('语音转换失败, 请检查语音文件是否正常');
        }
        const { md5, fileName, path, fileSize } = await this.core.apis.FileApi.uploadFile(silkPath, ElementType.PTT);
        if (fileSize === 0) {
            throw new Error('文件异常，大小为0');
        }
        if (converted) {
            fsPromises.unlink(silkPath);
        }
        return {
            elementType: ElementType.PTT,
            elementId: '',
            pttElement: {
                fileName: fileName,
                filePath: path,
                md5HexStr: md5,
                fileSize: fileSize,
                // duration: Math.max(1, Math.round(fileSize / 1024 / 3)), // 一秒钟大概是3kb大小, 小于1秒的按1秒算
                duration: duration ?? 1,
                formatType: 1,
                voiceType: 1,
                voiceChangeType: 0,
                canConvert2Text: true,
                waveAmplitudes: [
                    0, 18, 9, 23, 16, 17, 16, 15, 44, 17, 24, 20, 14, 15, 17,
                ],
                fileSubId: '',
                playState: 1,
                autoConvertText: 0,
            },
        };
    }

    async downloadMediaByUuid() {
        //napCatCore.session.getRichMediaService().downloadFileForFileUuid();
    }
    async downloadFileForModelId(peer: Peer, modelId: string, unknown: string, timeout = 1000 * 60 * 2) {
        const [, fileTransNotifyInfo] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelRichMediaService/downloadFileForModelId',
            'NodeIKernelMsgListener/onRichMediaDownloadComplete',
            [peer, [modelId], unknown],
            () => true,
            (arg) => arg?.commonFileInfo?.fileModelId === modelId,
            1,
            timeout,
        );
        return fileTransNotifyInfo.filePath;
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
        const [, fileTransNotifyInfo] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelMsgService/downloadRichMedia',
            'NodeIKernelMsgListener/onRichMediaDownloadComplete',
            [{
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
            }],
            () => true,
            (arg) => arg.msgId === msgId,
            1,
            timeout,
        );
        const msg = await this.core.apis.MsgApi.getMsgsByMsgId({
            guildId: '',
            chatType: chatType,
            peerUid: peerUid,
        }, [msgId]);
        if (msg.msgList.length === 0) {
            return fileTransNotifyInfo.filePath;
        }
        const mixElement = msg.msgList.find((msg) => msg.msgId === msgId)?.elements.find((e) => e.elementId === elementId);
        const mixElementInner = mixElement?.videoElement ?? mixElement?.fileElement ?? mixElement?.pttElement ?? mixElement?.picElement;
        let realPath = mixElementInner?.filePath;
        if (!realPath) {
            const picThumbPath: Map<number, string> = (mixElementInner as any)?.picThumbPath;
            const picThumbPathList = Array.from(picThumbPath.values());
            if (picThumbPathList.length > 0) realPath = picThumbPathList[0];
        }
        return realPath;
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
        if (peer.chatType === ChatType.KCHATTYPEGROUP) {
            GroupData =
                [{
                    groupCode: peer.peerUid,
                    isConf: false,
                    hasModifyConfGroupFace: true,
                    hasModifyConfGroupName: true,
                    groupName: 'NapCat.Cached',
                    remark: 'NapCat.Cached',
                }];
        } else if (peer.chatType === ChatType.KCHATTYPEC2C) {
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
        const Event = this.core.eventWrapper.createEventFunction('NodeIKernelSearchService/searchFileWithKeywords');
        const id = await Event!(keys, 12);
        const Listener = this.core.eventWrapper.registerListen(
            'NodeIKernelSearchListener/onSearchFileKeywordsResult',
            1,
            20000,
            (params) => id !== '' && params.searchId == id,
        );
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
        // const fileUuid = element.fileUuid;

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
            return `${IMAGE_HTTP_HOST}/gchatpic_new/0/0-0-${(fileMd5 ?? md5HexStr)!.toUpperCase()}/0`;
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
        // const _lastRecord = lastRecord ? lastRecord : { fileType: fileType };
        // 需要五个参数
        // return napCatCore.session.getStorageCleanService().getFileCacheInfo();
    }

    async clearChatCache(chats: ChatCacheListItemBasic[] = [], fileKeys: string[] = []) {
        return this.context.session.getStorageCleanService().clearChatCacheInfo(chats, fileKeys);
    }
}
