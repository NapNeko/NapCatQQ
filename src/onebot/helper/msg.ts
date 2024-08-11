import {
    AtType,
    ElementType,
    FaceIndex,
    FaceType,
    NapCatCore,
    PicType,
    SendArkElement,
    SendFaceElement,
    SendFileElement,
    SendMarkdownElement,
    SendMarketFaceElement,
    SendPicElement,
    SendPttElement,
    SendReplyElement,
    sendShareLocationElement,
    SendTextElement,
    SendVideoElement,
    viedo_type,
} from '@/core';
import { promises as fs } from 'node:fs';
import ffmpeg from 'fluent-ffmpeg';
import { calculateFileMD5, isGIF } from '@/common/utils/file';
import { getVideoInfo } from '@/common/utils/video';
import { encodeSilk } from '@/common/utils/audio';
import faceConfig from '@/core/external/face_config.json';
import * as pathLib from 'node:path';

export class SendMsgElementConstructor {
    static location(CoreContext: NapCatCore): sendShareLocationElement {
        return {
            elementType: ElementType.SHARELOCATION,
            elementId: '',
            shareLocationElement: {
                text: '测试',
                ext: '',
            },
        };
    }

    static text(CoreContext: NapCatCore, content: string): SendTextElement {
        return {
            elementType: ElementType.TEXT,
            elementId: '',
            textElement: {
                content,
                atType: AtType.notAt,
                atUid: '',
                atTinyId: '',
                atNtUid: '',
            },
        };
    }

    static at(CoreContext: NapCatCore, atUid: string, atNtUid: string, atType: AtType, atName: string): SendTextElement {
        return {
            elementType: ElementType.TEXT,
            elementId: '',
            textElement: {
                content: `@${atName}`,
                atType,
                atUid,
                atTinyId: '',
                atNtUid,
            },
        };
    }

    static reply(CoreContext: NapCatCore, msgSeq: string, msgId: string, senderUin: string, senderUinStr: string): SendReplyElement {
        return {
            elementType: ElementType.REPLY,
            elementId: '',
            replyElement: {
                replayMsgSeq: msgSeq, // raw.msgSeq
                replayMsgId: msgId,  // raw.msgId
                senderUin: senderUin,
                senderUinStr: senderUinStr,
            },
        };
    }

    static async pic(coreContext: NapCatCore, picPath: string, summary: string = '', subType: 0 | 1 = 0): Promise<SendPicElement> {
        const NTQQGroupApi = coreContext.apis.GroupApi;
        const NTQQUserApi = coreContext.apis.UserApi;
        const NTQQFileApi = coreContext.apis.FileApi;
        const NTQQMsgApi = coreContext.apis.MsgApi;
        const NTQQFriendApi = coreContext.apis.FriendApi;
        const logger = coreContext.context.logger;
        const { md5, fileName, path, fileSize } = await NTQQFileApi.uploadFile(picPath, ElementType.PIC, subType);
        if (fileSize === 0) {
            throw '文件异常，大小为0';
        }
        const imageSize = await NTQQFileApi.getImageSize(picPath);
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
        //logDebug('图片信息', picElement);
        return {
            elementType: ElementType.PIC,
            elementId: '',
            picElement,
        };
    }

    static async file(coreContext: NapCatCore, filePath: string, fileName: string = '', folderId: string = ''): Promise<SendFileElement> {
        const NTQQGroupApi = coreContext.apis.GroupApi;
        const NTQQUserApi = coreContext.apis.UserApi;
        const NTQQFileApi = coreContext.apis.FileApi;
        const NTQQMsgApi = coreContext.apis.MsgApi;
        const NTQQFriendApi = coreContext.apis.FriendApi;
        const logger = coreContext.context.logger;
        const { md5, fileName: _fileName, path, fileSize } = await NTQQFileApi.uploadFile(filePath, ElementType.FILE);
        if (fileSize === 0) {
            throw '文件异常，大小为0';
        }
        const element: SendFileElement = {
            elementType: ElementType.FILE,
            elementId: '',
            fileElement: {
                fileName: fileName || _fileName,
                folderId: folderId,
                'filePath': path!,
                'fileSize': (fileSize).toString(),
            },
        };

        return element;
    }

    static async video(coreContext: NapCatCore, filePath: string, fileName: string = '', diyThumbPath: string = '', videotype: viedo_type = viedo_type.VIDEO_FORMAT_MP4): Promise<SendVideoElement> {
        const NTQQGroupApi = coreContext.apis.GroupApi;
        const NTQQUserApi = coreContext.apis.UserApi;
        const NTQQFileApi = coreContext.apis.FileApi;
        const NTQQMsgApi = coreContext.apis.MsgApi;
        const NTQQFriendApi = coreContext.apis.FriendApi;
        const logger = coreContext.context.logger;
        const { fileName: _fileName, path, fileSize, md5 } = await NTQQFileApi.uploadFile(filePath, ElementType.VIDEO);
        if (fileSize === 0) {
            throw '文件异常，大小为0';
        }
        let thumb = path.replace(`${pathLib.sep}Ori${pathLib.sep}`, `${pathLib.sep}Thumb${pathLib.sep}`);
        thumb = pathLib.dirname(thumb);
        // log("thumb 目录", thumb)
        let videoInfo = {
            width: 1920, height: 1080,
            time: 15,
            format: 'mp4',
            size: fileSize,
            filePath,
        };
        try {
            videoInfo = await getVideoInfo(path, logger);
            //logDebug('视频信息', videoInfo);
        } catch (e) {
            logger.logError('获取视频信息失败', e);
        }
        const createThumb = new Promise<string | undefined>((resolve, reject) => {
            const thumbFileName = `${md5}_0.png`;
            const thumbPath = pathLib.join(thumb, thumbFileName);
            ffmpeg(filePath)
                .on('end', () => {
                })
                .on('error', (err) => {
                    logger.logDebug('获取视频封面失败，使用默认封面', err);
                    if (diyThumbPath) {
                        fs.copyFile(diyThumbPath, thumbPath).then(() => {
                            resolve(thumbPath);
                        }).catch(reject);
                    } else {
                        resolve(undefined);
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
        const thumbSize = _thumbPath ? (await fs.stat(_thumbPath)).size : 0;
        // log("生成缩略图", _thumbPath)
        thumbPath.set(0, _thumbPath);
        const thumbMd5 = _thumbPath ? await calculateFileMD5(_thumbPath) : "";
        const element: SendVideoElement = {
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
                //fileFormat: videotype
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
        return element;
    }

    static async ptt(coreContext: NapCatCore, pttPath: string): Promise<SendPttElement> {
        const NTQQGroupApi = coreContext.apis.GroupApi;
        const NTQQUserApi = coreContext.apis.UserApi;
        const NTQQFileApi = coreContext.apis.FileApi;
        const NTQQMsgApi = coreContext.apis.MsgApi;
        const NTQQFriendApi = coreContext.apis.FriendApi;
        const logger = coreContext.context.logger;
        const {
            converted,
            path: silkPath,
            duration,
        } = await encodeSilk(pttPath, coreContext.NapCatTempPath, coreContext.context.logger);
        // log("生成语音", silkPath, duration);
        if (!silkPath) {
            throw '语音转换失败, 请检查语音文件是否正常';
        }
        const { md5, fileName, path, fileSize } = await NTQQFileApi.uploadFile(silkPath!, ElementType.PTT);
        if (fileSize === 0) {
            throw '文件异常，大小为0';
        }
        if (converted) {
            fs.unlink(silkPath).then();
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
                duration: duration || 1,
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

    // NodeIQQNTWrapperSession sendMsg  [
    //   "0",
    //   {
    //     "peerUid": "u_e_RIxgTs2NaJ68h0PwOPSg",
    //     "chatType": 1,
    //     "guildId": ""
    //   },
    //   [
    //     {
    //       "elementId": "0",
    //       "elementType": 6,
    //       "faceElement": {
    //         "faceIndex": 0,
    //         "faceType": 5,
    //         "msgType": 0,
    //         "pokeType": 1,
    //         "pokeStrength": 0
    //       }
    //     }
    //   ],
    //   {}
    // ]
    static face(CoreContext: NapCatCore, faceId: number): SendFaceElement {
        // 从face_config.json中获取表情名称
        const sysFaces = faceConfig.sysface;
        const emojiFaces = faceConfig.emoji;
        const face: any = sysFaces.find((face) => face.QSid === faceId.toString());
        faceId = parseInt(faceId.toString());
        // let faceType = parseInt(faceId.toString().substring(0, 1));
        let faceType = 1;
        if (faceId >= 222) {
            faceType = 2;
        }
        if (face.AniStickerType) {
            faceType = 3;
        }
        return {
            elementType: ElementType.FACE,
            elementId: '',
            faceElement: {
                faceIndex: faceId,
                faceType,
                faceText: face.QDes,
                stickerId: face.AniStickerId,
                stickerType: face.AniStickerType,
                packId: face.AniStickerPackId,
                sourceType: 1,
            },
        };
    }

    static mface(CoreContext: NapCatCore, emojiPackageId: number, emojiId: string, key: string, faceName: string): SendMarketFaceElement {
        return {
            elementType: ElementType.MFACE,
            marketFaceElement: {
                emojiPackageId,
                emojiId,
                key,
                faceName: faceName || '[商城表情]',
            },
        };
    }

    static dice(CoreContext: NapCatCore, resultId: number | null): SendFaceElement {
        // 实际测试并不能控制结果

        // 随机1到6
        // if (isNull(resultId)) resultId = Math.floor(Math.random() * 6) + 1;
        return {
            elementType: ElementType.FACE,
            elementId: '',
            faceElement: {
                faceIndex: FaceIndex.dice,
                faceType: FaceType.dice,
                'faceText': '[骰子]',
                'packId': '1',
                'stickerId': '33',
                'sourceType': 1,
                'stickerType': 2,
                // resultId: resultId.toString(),
                'surpriseId': '',
                // "randomType": 1,
            },
        };
    }

    // 猜拳(石头剪刀布)表情
    static rps(CoreContext: NapCatCore, resultId: number | null): SendFaceElement {
        // 实际测试并不能控制结果
        // if (isNull(resultId)) resultId = Math.floor(Math.random() * 3) + 1;
        return {
            elementType: ElementType.FACE,
            elementId: '',
            faceElement: {
                'faceIndex': FaceIndex.RPS,
                'faceText': '[包剪锤]',
                'faceType': 3,
                'packId': '1',
                'stickerId': '34',
                'sourceType': 1,
                'stickerType': 2,
                // 'resultId': resultId.toString(),
                'surpriseId': '',
                // "randomType": 1,
            },
        };
    }

    static ark(CoreContext: NapCatCore, data: any): SendArkElement {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }
        return {
            elementType: ElementType.ARK,
            elementId: '',
            arkElement: {
                bytesData: data,
                linkInfo: null,
                subElementType: null,
            },
        };
    }

    static markdown(CoreContext: NapCatCore, content: string): SendMarkdownElement {
        return {
            elementType: ElementType.MARKDOWN,
            elementId: '',
            markdownElement: {
                content,
            },
        };
    }
}
