import {
    ChatType,
    ElementType,
    IMAGE_HTTP_HOST,
    IMAGE_HTTP_HOST_NT,
    Peer,
    PicElement,
    PicSubType,
    RawMessage,
    SendFileElement,
    SendPicElement,
    SendPttElement,
    SendVideoElement,
} from '@/core/types';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { InstanceContext, NapCatCore, SearchResultItem } from '@/core';
import { fileTypeFromFile } from 'file-type';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { RkeyManager } from '@/core/helper/rkey';
import { calculateFileMD5 } from '@/common/file';
import pathLib from 'node:path';
import { defaultVideoThumbB64, getVideoInfo } from '@/common/video';
import ffmpeg from 'fluent-ffmpeg';
import { encodeSilk } from '@/common/audio';
import { SendMessageContext } from '@/onebot/api';
import { getFileTypeForSendType } from '../helper/msg';

export class NTQQFileApi {
    context: InstanceContext;
    core: NapCatCore;
    rkeyManager: RkeyManager;
    packetRkey: Array<{ rkey: string; time: number; type: number; ttl: bigint }> | undefined;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
        this.rkeyManager = new RkeyManager([
            'https://rkey.napneko.icu/rkeys'
        ],
        this.context.logger
        );
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
        const extOrEmpty = await fileTypeFromFile(filePath).then(e => e?.ext ?? '').catch(e => '');
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

        await this.copyFile(filePath, mediaPath);
        const fileSize = await this.getFileSize(filePath);
        return {
            md5: fileMd5,
            fileName,
            path: mediaPath,
            fileSize,
            ext,
        };
    }

    async createValidSendFileElement(context: SendMessageContext, filePath: string, fileName: string = '', folderId: string = '',): Promise<SendFileElement> {
        const {
            fileName: _fileName,
            path,
            fileSize,
        } = await this.core.apis.FileApi.uploadFile(filePath, ElementType.FILE);
        if (fileSize === 0) {
            throw new Error('文件异常，大小为0');
        }
        context.deleteAfterSentFiles.push(path);
        return {
            elementType: ElementType.FILE,
            elementId: '',
            fileElement: {
                fileName: fileName || _fileName,
                folderId: folderId,
                filePath: path,
                fileSize: fileSize.toString(),
            },
        };
    }

    async createValidSendPicElement(context: SendMessageContext, picPath: string, summary: string = '', subType: PicSubType = 0): Promise<SendPicElement> {
        const { md5, fileName, path, fileSize } = await this.core.apis.FileApi.uploadFile(picPath, ElementType.PIC, subType);
        if (fileSize === 0) {
            throw new Error('文件异常，大小为0');
        }
        const imageSize = await this.core.apis.FileApi.getImageSize(picPath);
        context.deleteAfterSentFiles.push(path);
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
                picType: await getFileTypeForSendType(picPath),
                picSubType: subType,
                fileUuid: '',
                fileSubId: '',
                thumbFileSize: 0,
                summary,
            } as PicElement,
        };
    }

    async createValidSendVideoElement(context: SendMessageContext, filePath: string, fileName: string = '', diyThumbPath: string = ''): Promise<SendVideoElement> {
        let videoInfo = {
            width: 1920,
            height: 1080,
            time: 15,
            format: 'mp4',
            size: 0,
            filePath,
        };
        try {
            videoInfo = await getVideoInfo(filePath, this.context.logger);
        } catch (e) {
            this.context.logger.logError('获取视频信息失败，将使用默认值', e);
        }

        let fileExt = 'mp4';
        try {
            const tempExt = (await fileTypeFromFile(filePath))?.ext;
            if (tempExt) fileExt = tempExt;
        } catch (e) {
            this.context.logger.logError('获取文件类型失败', e);
        }
        const newFilePath = filePath + '.' + fileExt;
        fs.copyFileSync(filePath, newFilePath);
        context.deleteAfterSentFiles.push(newFilePath);
        filePath = newFilePath;
        const { fileName: _fileName, path, fileSize, md5 } = await this.core.apis.FileApi.uploadFile(filePath, ElementType.VIDEO);
        if (fileSize === 0) {
            throw new Error('文件异常，大小为0');
        }
        videoInfo.size = fileSize;
        let thumb = path.replace(`${pathLib.sep}Ori${pathLib.sep}`, `${pathLib.sep}Thumb${pathLib.sep}`);
        thumb = pathLib.dirname(thumb);

        const thumbPath = new Map();
        const _thumbPath = await new Promise<string | undefined>((resolve, reject) => {
            const thumbFileName = `${md5}_0.png`;
            const thumbPath = pathLib.join(thumb, thumbFileName);
            ffmpeg(filePath)
                .on('error', (err) => {
                    try {
                        this.context.logger.logDebug('获取视频封面失败，使用默认封面', err);
                        if (diyThumbPath) {
                            fsPromises.copyFile(diyThumbPath, thumbPath).then(() => {
                                resolve(thumbPath);
                            }).catch(reject);
                        } else {
                            fs.writeFileSync(thumbPath, Buffer.from(defaultVideoThumbB64, 'base64'));
                            resolve(thumbPath);
                        }
                    } catch (error) {
                        this.context.logger.logError('获取视频封面失败，使用默认封面失败', error);
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
        context.deleteAfterSentFiles.push(path);
        const uploadName = (fileName || _fileName).toLocaleLowerCase().endsWith('.' + fileExt.toLocaleLowerCase()) ? (fileName || _fileName) : (fileName || _fileName) + '.' + fileExt;
        return {
            elementType: ElementType.VIDEO,
            elementId: '',
            videoElement: {
                fileName: uploadName,
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
            fsPromises.unlink(silkPath).then().catch((e) => this.context.logger.logError('删除临时文件失败', e)
            );
        }
        return {
            elementType: ElementType.PTT,
            elementId: '',
            pttElement: {
                fileName: fileName,
                filePath: path,
                md5HexStr: md5,
                fileSize: fileSize.toString(),
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

    async downloadRawMsgMedia(msg: RawMessage[]) {
        const res = await Promise.all(
            msg.map(m =>
                Promise.all(
                    m.elements
                        .filter(element =>
                            element.elementType === ElementType.PIC ||
                            element.elementType === ElementType.VIDEO ||
                            element.elementType === ElementType.PTT ||
                            element.elementType === ElementType.FILE
                        )
                        .map(element =>
                            this.downloadMedia(m.msgId, m.chatType, m.peerUid, element.elementId, '', '', 1000 * 60 * 2, true)
                        )
                )
            )
        );
        msg.forEach((m, msgIndex) => {
            const elementResults = res[msgIndex];
            let elementIndex = 0;
            m.elements.forEach(element => {
                if (
                    element.elementType === ElementType.PIC ||
                    element.elementType === ElementType.VIDEO ||
                    element.elementType === ElementType.PTT ||
                    element.elementType === ElementType.FILE
                ) {
                    switch (element.elementType) {
                    case ElementType.PIC:
                            element.picElement!.sourcePath = elementResults[elementIndex];
                        break;
                    case ElementType.VIDEO:
                            element.videoElement!.filePath = elementResults[elementIndex];
                        break;
                    case ElementType.PTT:
                            element.pttElement!.filePath = elementResults[elementIndex];
                        break;
                    case ElementType.FILE:
                            element.fileElement!.filePath = elementResults[elementIndex];
                        break;
                    }
                    elementIndex++;
                }
            });
        });
    }

    async downloadMedia(msgId: string, chatType: ChatType, peerUid: string, elementId: string, thumbPath: string, sourcePath: string, timeout = 1000 * 60 * 2, force: boolean = false) {
        // 用于下载文件
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
        const [, completeRetData] = await this.core.eventWrapper.callNormalEventV2(
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
            (arg) => arg.msgElementId === elementId && arg.msgId === msgId,
            1,
            timeout,
        );
        return completeRetData.filePath;
    }

    async getImageSize(filePath: string): Promise<ISizeCalculationResult> {
        return new Promise((resolve, reject) => {
            imageSize(filePath, (err: Error | null, dimensions) => {
                if (err) {
                    reject(new Error(err.message));
                } else if (!dimensions) {
                    reject(new Error('获取图片尺寸失败'));
                } else {
                    resolve(dimensions);
                }
            });
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

    async getImageUrl(element: PicElement): Promise<string> {
        if (!element) {
            return '';
        }

        const url: string = element.originImageUrl ?? '';

        const md5HexStr = element.md5HexStr;
        const fileMd5 = element.md5HexStr;
        const parsedUrl = new URL(IMAGE_HTTP_HOST + url);
        const imageAppid = parsedUrl.searchParams.get('appid');
        const isNTV2 = imageAppid && ['1406', '1407'].includes(imageAppid);
        const imageFileId = parsedUrl.searchParams.get('fileid');
        if (url && isNTV2 && imageFileId) {
            const rkeyData = await this.getRkeyData();
            return this.getImageUrlFromParsedUrl(imageFileId, imageAppid, rkeyData);
        }
        return this.getImageUrlFromMd5(fileMd5, md5HexStr);
    }

    private async getRkeyData() {
        const rkeyData = {
            private_rkey: 'CAQSKAB6JWENi5LM_xp9vumLbuThJSaYf-yzMrbZsuq7Uz2qEc3Rbib9LP4',
            group_rkey: 'CAQSKAB6JWENi5LM_xp9vumLbuThJSaYf-yzMrbZsuq7Uz2qffcqm614gds',
            online_rkey: false
        };

        try {
            if (this.core.apis.PacketApi.available) {
                const rkey_expired_private = !this.packetRkey || this.packetRkey[0].time + Number(this.packetRkey[0].ttl) < Date.now() / 1000;
                const rkey_expired_group = !this.packetRkey || this.packetRkey[0].time + Number(this.packetRkey[0].ttl) < Date.now() / 1000;
                if (rkey_expired_private || rkey_expired_group) {
                    this.packetRkey = await this.core.apis.PacketApi.pkt.operation.FetchRkey();
                }
                if (this.packetRkey && this.packetRkey.length > 0) {
                    rkeyData.group_rkey = this.packetRkey[1].rkey.slice(6);
                    rkeyData.private_rkey = this.packetRkey[0].rkey.slice(6);
                    rkeyData.online_rkey = true;
                }
            }
        } catch (error: any) {
            this.context.logger.logError('获取rkey失败', error.message);
        }

        if (!rkeyData.online_rkey) {
            try {
                const tempRkeyData = await this.rkeyManager.getRkey();
                rkeyData.group_rkey = tempRkeyData.group_rkey;
                rkeyData.private_rkey = tempRkeyData.private_rkey;
                rkeyData.online_rkey = tempRkeyData.expired_time > Date.now() / 1000;
            } catch (e) {
                this.context.logger.logDebug('获取rkey失败 Fallback Old Mode', e);
            }
        }

        return rkeyData;
    }

    private getImageUrlFromParsedUrl(imageFileId: string, appid: string, rkeyData: any): string {
        const rkey = appid === '1406' ? rkeyData.private_rkey : rkeyData.group_rkey;
        if (rkeyData.online_rkey) {
            return IMAGE_HTTP_HOST_NT + `/download?appid=${appid}&fileid=${imageFileId}&rkey=${rkey}`;
        }
        return IMAGE_HTTP_HOST + `/download?appid=${appid}&fileid=${imageFileId}&rkey=${rkey}&spec=0`;
    }

    private getImageUrlFromMd5(fileMd5: string | undefined, md5HexStr: string | undefined): string {
        if (fileMd5 || md5HexStr) {
            return `${IMAGE_HTTP_HOST}/gchatpic_new/0/0-0-${(fileMd5 ?? md5HexStr ?? '').toUpperCase()}/0`;
        }

        this.context.logger.logDebug('图片url获取失败', { fileMd5, md5HexStr });
        return '';
    }
}

