

import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { encodeSilk } from '@/napcat-core/helper/audio';
import { FFmpegService } from '@/napcat-core/helper/ffmpeg/ffmpeg';
import { calculateFileMD5 } from 'napcat-common/src/file';
import { ElementType, NapCatCore, PicElement, PicSubType, SendFileElement, SendPicElement, SendPttElement, SendVideoElement } from 'napcat-core';
import { getFileTypeForSendType } from 'napcat-core/helper/msg';
import { imageSizeFallBack } from 'napcat-image-size';
import { SendMessageContext } from './msg';
import { fileTypeFromFile } from 'file-type';
import pathLib from 'node:path';
import fsPromises from 'fs/promises';
import fs from 'fs';
import { defaultVideoThumbB64 } from '@/napcat-core/helper/ffmpeg/video';
export class OneBotFileApi {
    obContext: NapCatOneBot11Adapter;
    core: NapCatCore;
    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }
    async createValidSendFileElement(context: SendMessageContext, filePath: string, fileName: string = '', folderId: string = ''): Promise<SendFileElement> {
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
                folderId,
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
        const imageSize = await imageSizeFallBack(picPath);
        context.deleteAfterSentFiles.push(path);
        return {
            elementType: ElementType.PIC,
            elementId: '',
            picElement: {
                md5HexStr: md5,
                fileSize: fileSize.toString(),
                picWidth: imageSize.width,
                picHeight: imageSize.height,
                fileName,
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

    async createValidSendVideoElement(context: SendMessageContext, filePath: string, fileName: string = '', _diyThumbPath: string = ''): Promise<SendVideoElement> {
        let videoInfo = {
            width: 1920,
            height: 1080,
            time: 15,
            format: 'mp4',
            size: 0,
            filePath,
        };
        let fileExt = 'mp4';
        try {
            const tempExt = (await fileTypeFromFile(filePath))?.ext;
            if (tempExt) fileExt = tempExt;
        } catch (e) {
            this.core.context.logger.logError('获取文件类型失败', e);
        }
        const newFilePath = `${filePath}.${fileExt}`;
        fs.copyFileSync(filePath, newFilePath);
        context.deleteAfterSentFiles.push(newFilePath);
        filePath = newFilePath;

        const { fileName: _fileName, path, fileSize, md5 } = await this.core.apis.FileApi.uploadFile(filePath, ElementType.VIDEO);
        context.deleteAfterSentFiles.push(path);
        if (fileSize === 0) {
            throw new Error('文件异常，大小为0');
        }
        const thumbDir = path.replace(`${pathLib.sep}Ori${pathLib.sep}`, `${pathLib.sep}Thumb${pathLib.sep}`);
        fs.mkdirSync(pathLib.dirname(thumbDir), { recursive: true });
        const thumbPath = pathLib.join(pathLib.dirname(thumbDir), `${md5}_0.png`);
        try {
            videoInfo = await FFmpegService.getVideoInfo(filePath, thumbPath);
            if (!fs.existsSync(thumbPath)) {
                this.core.context.logger.logError('获取视频缩略图失败', new Error('缩略图不存在'));
                throw new Error('获取视频缩略图失败');
            }
        } catch (e) {
            this.core.context.logger.logError('获取视频信息失败', e);
            fs.writeFileSync(thumbPath, Buffer.from(defaultVideoThumbB64, 'base64'));
        }
        if (_diyThumbPath) {
            try {
                await this.core.apis.FileApi.copyFile(_diyThumbPath, thumbPath);
            } catch (e) {
                this.core.context.logger.logError('复制自定义缩略图失败', e);
            }
        }
        context.deleteAfterSentFiles.push(thumbPath);
        const thumbSize = (await fsPromises.stat(thumbPath)).size;
        const thumbMd5 = await calculateFileMD5(thumbPath);
        context.deleteAfterSentFiles.push(thumbPath);

        const uploadName = (fileName || _fileName).toLocaleLowerCase().endsWith(`.${fileExt.toLocaleLowerCase()}`) ? (fileName || _fileName) : `${fileName || _fileName}.${fileExt}`;
        return {
            elementType: ElementType.VIDEO,
            elementId: '',
            videoElement: {
                fileName: uploadName,
                filePath: path,
                videoMd5: md5,
                thumbMd5,
                fileTime: videoInfo.time,
                thumbPath: new Map([[0, thumbPath]]),
                thumbSize,
                thumbWidth: videoInfo.width,
                thumbHeight: videoInfo.height,
                fileSize: fileSize.toString(),
            },
        };
    }

    async createValidSendPttElement(_context: SendMessageContext, pttPath: string): Promise<SendPttElement> {
        const { converted, path: silkPath, duration } = await encodeSilk(pttPath, this.core.NapCatTempPath, this.core.context.logger);
        if (!silkPath) {
            throw new Error('语音转换失败, 请检查语音文件是否正常');
        }
        const { md5, fileName, path, fileSize } = await this.core.apis.FileApi.uploadFile(silkPath, ElementType.PTT);
        if (fileSize === 0) {
            throw new Error('文件异常，大小为0');
        }
        if (converted) {
            fsPromises.unlink(silkPath).then().catch((e) => this.core.context.logger.logError('删除临时文件失败', e));
        }
        return {
            elementType: ElementType.PTT,
            elementId: '',
            pttElement: {
                fileName,
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
                storeID: 0,
                otherBusinessInfo: {
                    aiVoiceType: 0,
                },
            },
        };
    }

}
