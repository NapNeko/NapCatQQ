import {
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
import { InstanceContext, NapCatCore, SearchResultItem } from '@/core';
import * as fileType from 'file-type';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { RkeyManager } from '../helper/rkey';
import { calculateFileMD5, isGIF } from '@/common/file';
import pathLib from 'node:path';
import { defaultVideoThumbB64, getVideoInfo } from '@/common/video';
import ffmpeg from 'fluent-ffmpeg';
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

    async uploadFile(filePath: string, elementType: ElementType = ElementType.PIC, elementSubType: number = 0) {
        const fileMd5 = await calculateFileMD5(filePath);
        const extOrEmpty = (await fileType.fileTypeFromFile(filePath))?.ext;
        const ext = extOrEmpty ? `.${extOrEmpty}` : '';
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

    async createValidSendFileElement(filePath: string, fileName: string = '', folderId: string = '',): Promise<SendFileElement> {
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

    async createValidSendPicElement(picPath: string, summary: string = '', subType: 0 | 1 = 0,): Promise<SendPicElement> {
        const { md5, fileName, path, fileSize } = await this.core.apis.FileApi.uploadFile(picPath, ElementType.PIC, subType);
        if (fileSize === 0) {
            throw new Error('文件异常，大小为0');
        }
        const imageSize = await this.core.apis.FileApi.getImageSize(picPath);
        return {
            elementType: ElementType.PIC,
            elementId: '',
            picElement: {
                md5HexStr: md5,
                fileSize: fileSize.toString(),
                picWidth: imageSize.width,
                picHeight: imageSize.height,
                fileName: fileName,
                sourcePath: path,
                original: true,
                picType: isGIF(picPath) ? PicType.gif : PicType.jpg,
                picSubType: subType,
                fileUuid: '',
                fileSubId: '',
                thumbFileSize: 0,
                summary,
            } as PicElement,
        };
    }

    async createValidSendVideoElement(filePath: string, fileName: string = '', diyThumbPath: string = ''): Promise<SendVideoElement> {
        const logger = this.core.context.logger;
        const { fileName: _fileName, path, fileSize, md5 } = await this.core.apis.FileApi.uploadFile(filePath, ElementType.VIDEO);
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
            logger.logError('获取视频信息失败，将使用默认值', e);
        }
        const thumbPath = new Map();
        const _thumbPath = await new Promise<string | undefined>((resolve, reject) => {
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
                        fs.writeFileSync(thumbPath, Buffer.from(defaultVideoThumbB64, 'base64'));
                        resolve(thumbPath);
                    }
                })
                .screenshots({
                    timestamps: [0],
                    filename: thumbFileName,
                    folder: thumb,
                    size: videoInfo.width + 'x' + videoInfo.height,
                })
                .on('end', () => {
                    resolve(thumbPath);
                });
        });
        const thumbSize = _thumbPath ? (await fsPromises.stat(_thumbPath)).size : 0;
        thumbPath.set(0, _thumbPath);
        const thumbMd5 = _thumbPath ? await calculateFileMD5(_thumbPath) : '';
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
            },
        };
    }

    async createValidSendPttElement(pttPath: string): Promise<SendPttElement> {
        const { converted, path: silkPath, duration } = await encodeSilk(pttPath, this.core.NapCatTempPath, this.core.context.logger);
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
        await this.core.eventWrapper.callNormalEventV2(
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
        const mixElement = (await this.core.apis.MsgApi.getMsgsByMsgId({
            guildId: '',
            chatType: chatType,
            peerUid: peerUid,
        }, [msgId])).msgList
            .find((msg) => msg.msgId === msgId)
            ?.elements.find((e) => e.elementId === elementId);
        const mixElementInner = mixElement?.videoElement
            ?? mixElement?.fileElement
            ?? mixElement?.pttElement
            ?? mixElement?.picElement;
        let realPath = mixElementInner?.filePath;
        if (!realPath) {
            const picThumbPath: Map<number, string> = (mixElementInner as any)?.picThumbPath;
            const picThumbPathList = Array.from(picThumbPath.values());
            if (picThumbPathList.length > 0) realPath = picThumbPathList[0];
        }
        return realPath;
    }

    async getImageSize(filePath: string): Promise<ISizeCalculationResult> {
        return new Promise((resolve, reject) => {
            imageSize(filePath, (err, dimensions) => {
                if (err) {
                    reject(err);
                } else {
                    if (!dimensions) {
                        reject(new Error('获取图片尺寸失败'));
                    } else {
                        resolve(dimensions);
                    }
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

    async searchForFile(keys: string[]): Promise<SearchResultItem | undefined> {
        const randomResultId = 100000 + Math.floor(Math.random() * 10000);
        let searchId = 0;
        const [, searchResult] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelFileAssistantService/searchFile',
            'NodeIKernelFileAssistantListener/onFileSearch',
            [
                keys,
                { resultType: 2, pageLimit: 1 },
                randomResultId,
            ],
            (ret) => {
                searchId = ret;
                return true;
            },
            result => result.searchId === searchId && result.resultId === randomResultId,
        );
        return searchResult.resultItems[0];
    }

    async downloadFileById(
        fileId: string,
        fileSize: number = 1024576,
        estimatedTime: number = (fileSize * 1000 / 1024576) + 5000,
    ) {
        const [, fileData] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelFileAssistantService/downloadFile',
            'NodeIKernelFileAssistantListener/onFileStatusChanged',
            [[fileId]],
            ret => ret.result === 0,
            status => status.fileStatus === 2 && status.fileProgress === '0',
            1,
            estimatedTime, // estimate 1MB/s
        );
        return fileData.filePath!;
    }

    async getImageUrl(element: PicElement) {
        if (!element) {
            return '';
        }
        const url: string = element.originImageUrl!;  // 没有域名
        const md5HexStr = element.md5HexStr;
        const fileMd5 = element.md5HexStr;

        if (url) {
            const parsedUrl = new URL(IMAGE_HTTP_HOST + url);//临时解析拼接
            const imageAppid = parsedUrl.searchParams.get('appid');
            const isNTFlavoredPic = imageAppid && ['1406', '1407'].includes(imageAppid);
            if (isNTFlavoredPic) {
                let rkey = parsedUrl.searchParams.get('rkey');
                if (rkey) {
                    return IMAGE_HTTP_HOST_NT + url;
                }
                const rkeyData = await this.rkeyManager.getRkey();
                rkey = imageAppid === '1406' ? rkeyData.private_rkey : rkeyData.group_rkey;
                return IMAGE_HTTP_HOST_NT + url + `${rkey}`;
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

