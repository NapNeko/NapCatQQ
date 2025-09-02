import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { MessageUnique } from '@/common/message-unique';
import {
    ChatType,
    CustomMusicSignPostData,
    ElementType,
    FaceIndex,
    FaceType,
    GrayTipElement,
    GroupNotify,
    IdMusicSignPostData,
    MessageElement,
    NapCatCore,
    NTGrayTipElementSubTypeV2,
    NTMsgAtType,
    Peer,
    RawMessage,
    SendMessageElement,
    SendTextElement,
} from '@/core';
import faceConfig from '@/core/external/face_config.json';
import {
    NapCatOneBot11Adapter,
    OB11Message,
    OB11MessageData,
    OB11MessageDataType,
    OB11MessageFileBase,
    OB11MessageForward,
    OB11MessageImage,
    OB11MessageVideo,
} from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { EventType } from '@/onebot/event/OneBotEvent';
import { encodeCQCode } from '@/onebot/helper/cqcode';
import { uriToLocalFile } from '@/common/file';
import { RequestUtil } from '@/common/request';
import fsPromise from 'node:fs/promises';
import { OB11FriendAddNoticeEvent } from '@/onebot/event/notice/OB11FriendAddNoticeEvent';
import { ForwardMsgBuilder } from '@/common/forward-msg-builder';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OB11GroupIncreaseEvent } from '../event/notice/OB11GroupIncreaseEvent';
import { GroupDecreaseSubType, OB11GroupDecreaseEvent } from '../event/notice/OB11GroupDecreaseEvent';
import { GroupAdmin } from '@/core/packet/transformer/proto/message/groupAdmin';
import { OB11GroupAdminNoticeEvent } from '../event/notice/OB11GroupAdminNoticeEvent';
import { GroupChange, GroupChangeInfo, GroupInvite, PushMsgBody } from '@/core/packet/transformer/proto';
import { OB11GroupRequestEvent } from '../event/request/OB11GroupRequest';
import { LRUCache } from '@/common/lru-cache';
import { cleanTaskQueue } from '@/common/clean-task';
import { registerResource } from '@/common/health';

type RawToOb11Converters = {
    [Key in keyof MessageElement as Key extends `${string}Element` ? Key : never]: (
        element: Exclude<MessageElement[Key], null | undefined>,
        msg: RawMessage,
        elementWrapper: MessageElement,
        context: RecvMessageContext
    ) => Promise<OB11MessageData | null | undefined>
}

type Ob11ToRawConverters = {
    [Key in OB11MessageDataType]: (
        sendMsg: Extract<OB11MessageData, { type: Key }>,
        context: SendMessageContext,
    ) => Promise<SendMessageElement | undefined>
}

export type SendMessageContext = {
    deleteAfterSentFiles: string[],
    peer: Peer
}

export type RecvMessageContext = {
    parseMultMsg: boolean,
    disableGetUrl: boolean,
    quick_reply: boolean
}

function keyCanBeParsed(key: string, parser: RawToOb11Converters): key is keyof RawToOb11Converters {
    return key in parser;
}

export class OneBotMsgApi {
    obContext: NapCatOneBot11Adapter;
    core: NapCatCore;
    notifyGroupInvite: LRUCache<string, GroupNotify> = new LRUCache(50);
    // seq -> notify
    rawToOb11Converters: RawToOb11Converters = {
        textElement: async element => {
            if (element.atType === NTMsgAtType.ATTYPEUNKNOWN) {
                let text = element.content;
                // 兼容 9.7.x 换行符
                if (text.indexOf('\n') === -1 && text.indexOf('\r\n') === -1) {
                    text = text.replace(/\r/g, '\n');
                }
                return {
                    type: OB11MessageDataType.text,
                    data: { text },
                };
            } else {
                let qq: string = 'all';
                if (element.atType !== NTMsgAtType.ATTYPEALL) {
                    const { atNtUid, atUid } = element;
                    qq = !atUid || atUid === '0' ? await this.core.apis.UserApi.getUinByUidV2(atNtUid) : String(Number(atUid) >>> 0);
                }
                return {
                    type: OB11MessageDataType.at,
                    data: {
                        qq: qq,
                        // name: content.slice(1);
                    },
                };
            }
        },

        picElement: async (element, msg, elementWrapper, { disableGetUrl }) => {
            try {
                const peer = {
                    chatType: msg.chatType,
                    peerUid: msg.peerUid,
                    guildId: '',
                };
                FileNapCatOneBotUUID.encode(
                    peer,
                    msg.msgId,
                    elementWrapper.elementId,
                    element.fileUuid,
                    element.fileName
                );
                return {
                    type: OB11MessageDataType.image,
                    data: {
                        summary: element.summary,
                        file: element.fileName,
                        sub_type: element.picSubType,
                        url: disableGetUrl ? (element.filePath ?? '') : await this.core.apis.FileApi.getImageUrl(element),
                        file_size: element.fileSize,
                    },
                };
            } catch (e) {
                this.core.context.logger.logError('获取图片url失败', (e as Error).stack);
                return;
            }
        },

        fileElement: async (element, msg, elementWrapper, { disableGetUrl }) => {
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };
            FileNapCatOneBotUUID.encode(peer, msg.msgId, elementWrapper.elementId, element.fileUuid, element.fileUuid);
            FileNapCatOneBotUUID.encode(peer, msg.msgId, elementWrapper.elementId, element.fileUuid, element.fileName);
            if (this.core.apis.PacketApi.packetStatus && !disableGetUrl) {
                let url;
                try {
                    //url = await this.core.apis.FileApi.getFileUrl(msg.chatType, msg.peerUid, element.fileUuid, element.file10MMd5, 1500)
                    url = await registerResource(
                        'file-url-get',
                        {
                            resourceFn: async () => {
                                return await this.core.apis.FileApi.getFileUrl(msg.chatType, msg.peerUid, element.fileUuid, element.file10MMd5, 1500);
                            },
                            healthCheckFn: async () => {
                                return await this.core.apis.PacketApi.pkt.operation.FetchRkey().then(() => true).catch(() => false);
                            },
                            testArgs: [],
                            healthCheckInterval: 30000,
                            maxHealthCheckFailures: 3
                        },
                    );
                } catch (error) {
                    url = '';
                }
                if (url) {
                    return {
                        type: OB11MessageDataType.file,
                        data: {
                            file: element.fileName,
                            file_id: element.fileUuid,
                            file_size: element.fileSize,
                            url: url,
                        },
                    }
                }
            }
            return {
                type: OB11MessageDataType.file,
                data: {
                    file: element.fileName,
                    file_id: element.fileUuid,
                    file_size: element.fileSize
                },
            };
        },

        faceElement: async element => {
            const faceIndex = element.faceIndex;
            if (element.faceType == FaceType.Poke) {
                return {
                    type: OB11MessageDataType.poke,
                    data: {
                        type: element?.pokeType?.toString() ?? '0',
                        id: faceIndex.toString(),
                    }
                };

            }

            if (faceIndex === FaceIndex.DICE) {
                return {
                    type: OB11MessageDataType.dice,
                    data: {
                        result: element.resultId!,
                    },
                };
            } else if (faceIndex === FaceIndex.RPS) {
                return {
                    type: OB11MessageDataType.rps,
                    data: {
                        result: element.resultId!,
                    },
                };
            } else {
                return {
                    type: OB11MessageDataType.face,
                    data: {
                        id: element.faceIndex.toString(),
                        raw: element,
                        resultId: element.resultId,
                        chainCount: element.chainCount,
                    },
                };
            }
        },

        marketFaceElement: async (_, msg, elementWrapper) => {
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };
            const { emojiId } = _;
            const dir = emojiId.substring(0, 2);
            const url = `https://gxh.vip.qq.com/club/item/parcel/item/${dir}/${emojiId}/raw300.gif`;
            const filename = `${dir}-${emojiId}.gif`;
            FileNapCatOneBotUUID.encode(peer, msg.msgId, elementWrapper.elementId, '', filename);
            return {
                type: OB11MessageDataType.image,
                data: {
                    summary: _.faceName, // 商城表情名称
                    file: filename,
                    url: url,
                    key: _.key,
                    emoji_id: _.emojiId,
                    emoji_package_id: _.emojiPackageId,
                },
            };
        },

        replyElement: async (element, msg, _, quick_reply) => {
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };

            // 创建回复数据的通用方法
            const createReplyData = (msgId: string): OB11MessageData => ({
                type: OB11MessageDataType.reply,
                data: {
                    id: MessageUnique.createUniqueMsgId(peer, msgId).toString(),
                },
            });

            // 查找记录
            const records = msg.records.find(msgRecord => msgRecord.msgId === element?.sourceMsgIdInRecords);

            // 特定账号的特殊处理
            if (records && (records.peerUin === '284840486' || records.peerUin === '1094950020')) {
                return createReplyData(records.msgId);
            }

            // 获取消息的通用方法组
            const tryFetchMethods = async (msgSeq: string, senderUid?: string, msgTime?: string, msgRandom?: string): Promise<RawMessage | undefined> => {
                try {
                    // 方法1：通过序号和时间筛选
                    if (senderUid && msgTime) {
                        const replyMsgList = (await this.core.apis.MsgApi.queryMsgsWithFilterExWithSeqV2(
                            peer, msgSeq, msgTime, [senderUid]
                        )).msgList;

                        const replyMsg = msgRandom
                            ? replyMsgList.find(msg => msg.msgRandom === msgRandom)
                            : replyMsgList.find(msg => msg.msgSeq === msgSeq);

                        if (replyMsg) return replyMsg;
                        if (quick_reply) {
                            this.core.context.logger.logWarn(`快速回复，跳过方法1查询，序号: ${msgSeq}, 消息数: ${replyMsgList.length}`);
                            return undefined;
                        }
                        this.core.context.logger.logWarn(`方法1查询失败，序号: ${msgSeq}, 消息数: ${replyMsgList.length}`);
                    }

                    // 方法2：直接通过序号获取
                    const replyMsgList = (await this.core.apis.MsgApi.getMsgsBySeqAndCount(
                        peer, msgSeq, 1, true, true
                    )).msgList;

                    const replyMsg = msgRandom
                        ? replyMsgList.find(msg => msg.msgRandom === msgRandom)
                        : replyMsgList.find(msg => msg.msgSeq === msgSeq);

                    if (replyMsg) return replyMsg;

                    this.core.context.logger.logWarn(`方法2查询失败，序号: ${msgSeq}, 消息数: ${replyMsgList.length}`);

                    // 方法3：另一种筛选方式
                    if (senderUid) {
                        const replyMsgList = (await this.core.apis.MsgApi.queryMsgsWithFilterExWithSeqV3(
                            peer, msgSeq, [senderUid]
                        )).msgList;

                        const replyMsg = msgRandom
                            ? replyMsgList.find(msg => msg.msgRandom === msgRandom)
                            : replyMsgList.find(msg => msg.msgSeq === msgSeq);

                        if (replyMsg) return replyMsg;

                        this.core.context.logger.logWarn(`方法3查询失败，序号: ${msgSeq}, 消息数: ${replyMsgList.length}`);
                    }

                    return undefined;
                } catch (error) {
                    this.core.context.logger.logError('查询回复消息出错', error);
                    return undefined;
                }
            };

            // 有记录情况下，使用完整信息查询
            if (records && element.replyMsgTime && element.senderUidStr) {
                const replyMsg = await tryFetchMethods(
                    element.replayMsgSeq,
                    element.senderUidStr,
                    records.msgTime,
                    records.msgRandom
                );

                if (replyMsg) {
                    return createReplyData(replyMsg.msgId);
                }

                this.core.context.logger.logError('所有查找方法均失败，获取不到带记录的引用消息', element.replayMsgSeq);
            } else {
                // 旧版客户端或不完整记录的情况，也尝试使用相同流程
                this.core.context.logger.logWarn('似乎是旧版客户端，尝试仅通过序号获取引用消息', element.replayMsgSeq);

                const replyMsg = await tryFetchMethods(element.replayMsgSeq);

                if (replyMsg) {
                    return createReplyData(replyMsg.msgId);
                }

                this.core.context.logger.logError('所有查找方法均失败，获取不到旧客户端的引用消息', element.replayMsgSeq);
            }

            return null;
        },
        videoElement: async (element, msg, elementWrapper, { disableGetUrl }) => {
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };
            //读取视频链接并兜底
            let videoUrlWrappers: Awaited<ReturnType<typeof this.core.apis.FileApi.getVideoUrl>> | undefined;

            if (msg.peerUin === '284840486' || msg.peerUin === '1094950020') {
                try {
                    videoUrlWrappers = await this.core.apis.FileApi.getVideoUrl({
                        chatType: msg.chatType,
                        peerUid: msg.peerUid,
                        guildId: '0',
                    }, msg.parentMsgIdList[0] ?? msg.msgId, elementWrapper.elementId);
                } catch {
                    this.core.context.logger.logWarn('合并获取视频 URL 失败');
                }
            } else {
                try {
                    videoUrlWrappers = await this.core.apis.FileApi.getVideoUrl({
                        chatType: msg.chatType,
                        peerUid: msg.peerUid,
                        guildId: '0',
                    }, msg.msgId, elementWrapper.elementId);
                } catch {
                    this.core.context.logger.logWarn('获取视频 URL 失败');
                }
            }


            //读取在线URL
            let videoDownUrl: string | undefined;

            if (videoUrlWrappers) {
                const videoDownUrlTemp = videoUrlWrappers.find((urlWrapper) => {
                    return !!(urlWrapper.url);
                });
                if (videoDownUrlTemp) {
                    videoDownUrl = videoDownUrlTemp.url;
                }
            }

            //开始兜底
            if (!videoDownUrl && !disableGetUrl) {
                if (this.core.apis.PacketApi.packetStatus) {
                    try {
                        //videoDownUrl = await this.core.apis.FileApi.getVideoUrlPacket(msg.peerUid, element.fileUuid, 1500);
                        videoDownUrl = await registerResource(
                            'video-url-get',
                            {
                                resourceFn: async () => {
                                    return await this.core.apis.FileApi.getVideoUrlPacket(msg.peerUid, element.fileUuid, 1500);
                                },
                                healthCheckFn: async () => {
                                    return await this.core.apis.PacketApi.pkt.operation.FetchRkey().then(() => true).catch(() => false);
                                },
                                testArgs: [],
                                healthCheckInterval: 30000,
                                maxHealthCheckFailures: 3
                            },
                        );
                    } catch (e) {
                        this.core.context.logger.logError('获取视频url失败', (e as Error).stack);
                        videoDownUrl = element.filePath;
                    }
                } else {
                    videoDownUrl = element.filePath;
                }

            }
            const fileCode = FileNapCatOneBotUUID.encode(peer, msg.msgId, elementWrapper.elementId, element.fileUuid, element.fileName);
            return {
                type: OB11MessageDataType.video,
                data: {
                    file: fileCode,
                    url: videoDownUrl,
                    file_size: element.fileSize,
                },
            };
        },

        pttElement: async (element, msg, elementWrapper, { disableGetUrl }) => {
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };
            const fileCode = FileNapCatOneBotUUID.encode(peer, msg.msgId, elementWrapper.elementId, '', element.fileName);
            let pttUrl = '';
            if (this.core.apis.PacketApi.packetStatus && !disableGetUrl) {
                try {
                    pttUrl = await registerResource(
                        'ptt-url-get',
                        {
                            resourceFn: async () => {
                                return await this.core.apis.FileApi.getPttUrl(msg.peerUid, element.fileUuid, 1500);
                            },
                            healthCheckFn: async () => {
                                return await this.core.apis.PacketApi.pkt.operation.FetchRkey().then(() => true).catch(() => false);
                            },
                            testArgs: [],
                            healthCheckInterval: 30000,
                            maxHealthCheckFailures: 3
                        },
                    );
                    //pttUrl = await this.core.apis.FileApi.getPttUrl(msg.peerUid, element.fileUuid, 1500);
                } catch (e) {
                    this.core.context.logger.logError('获取语音url失败', (e as Error).stack);
                    pttUrl = element.filePath;
                }
            } else {
                pttUrl = element.filePath;
            }
            if (pttUrl) {
                return {
                    type: OB11MessageDataType.voice,
                    data: {
                        file: fileCode,
                        path: element.filePath,
                        url: pttUrl,
                        file_size: element.fileSize,
                    },
                }
            }
            return {
                type: OB11MessageDataType.voice,
                data: {
                    file: fileCode,
                    file_size: element.fileSize,
                    path: element.filePath,
                },
            };
        },

        multiForwardMsgElement: async (element, msg, _wrapper, context) => {
            const parentMsgPeer = msg.parentMsgPeer ?? {
                chatType: msg.chatType,
                guildId: '',
                peerUid: msg.peerUid,
            };
            let multiMsgs = await this.getMultiMessages(msg, parentMsgPeer);
            // 拉取失败则跳过
            if (!multiMsgs || multiMsgs.length === 0) {
                try {
                    multiMsgs = await this.core.apis.PacketApi.pkt.operation.FetchForwardMsg(element.resId);
                } catch (e) {
                    this.core.context.logger.logError(`Protocol FetchForwardMsg fallback failed! 
                    element = ${JSON.stringify(element)} , error=${e})`);
                    return null;
                }
            }
            const forward: OB11MessageForward = {
                type: OB11MessageDataType.forward,
                data: { id: msg.msgId }
            };
            if (!context.parseMultMsg) return forward;
            forward.data.content = await this.parseMultiMessageContent(
                multiMsgs,
                parentMsgPeer,
                msg.parentMsgIdList
            );
            return forward;
        },

        arkElement: async (element) => {
            return {
                type: OB11MessageDataType.json,
                data: {
                    data: element.bytesData,
                },
            };
        },

        markdownElement: async (element) => {
            return {
                type: OB11MessageDataType.markdown,
                data: {
                    content: element.content,
                },
            };
        },
    };

    ob11ToRawConverters: Ob11ToRawConverters = {
        [OB11MessageDataType.text]: async ({ data: { text } }) => ({
            elementType: ElementType.TEXT,
            elementId: '',
            textElement: {
                content: text,
                atType: NTMsgAtType.ATTYPEUNKNOWN,
                atUid: '',
                atTinyId: '',
                atNtUid: '',
            },
        }),

        [OB11MessageDataType.at]: async ({ data: { qq: atQQ } }, context) => {
            function at(atUid: string, atNtUid: string, atType: NTMsgAtType, atName: string): SendTextElement {
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

            if (!context.peer || context.peer.chatType == ChatType.KCHATTYPEC2C) return undefined;
            if (atQQ === 'all') return at(atQQ, atQQ, NTMsgAtType.ATTYPEALL, '全体成员');
            const atMember = await this.core.apis.GroupApi.getGroupMember(context.peer.peerUid, atQQ);
            if (atMember) {
                return at(atQQ, atMember.uid, NTMsgAtType.ATTYPEONE, atMember.nick || atMember.cardName);
            }
            const uid = await this.core.apis.UserApi.getUidByUinV2(`${atQQ}`);
            if (!uid) throw new Error('Get Uid Error');
            const info = await this.core.apis.UserApi.getUserDetailInfo(uid);
            return at(atQQ, uid, NTMsgAtType.ATTYPEONE, info.nick || '');
        },

        [OB11MessageDataType.reply]: async ({ data: { id } }) => {
            const replyMsgM = MessageUnique.getMsgIdAndPeerByShortId(parseInt(id));
            if (!replyMsgM) {
                this.core.context.logger.logWarn('回复消息不存在', id);
                return undefined;
            }
            const replyMsg = (await this.core.apis.MsgApi.getMsgsByMsgId(
                replyMsgM.Peer, [replyMsgM.MsgId])).msgList[0];
            return replyMsg ?
                {
                    elementType: ElementType.REPLY,
                    elementId: '',
                    replyElement: {
                        replayMsgSeq: replyMsg.msgSeq, // raw.msgSeq
                        replayMsgId: replyMsg.msgId,  // raw.msgId
                        senderUin: replyMsg.senderUin,
                        senderUinStr: replyMsg.senderUin,
                        replyMsgClientSeq: replyMsg.clientSeq,
                        _replyMsgPeer: replyMsgM.Peer
                    },
                } :
                undefined;
        },

        [OB11MessageDataType.face]: async ({ data: { id, resultId, chainCount } }) => {
            const parsedFaceId = +id;
            // 从face_config.json中获取表情名称
            const sysFaces = faceConfig.sysface;
            const face: {
                QSid?: string,
                QDes?: string,
                AniStickerId?: string,
                AniStickerType?: number,
                AniStickerPackId?: string,
            } | undefined = sysFaces.find((systemFace) => systemFace.QSid === parsedFaceId.toString());
            if (!face) {
                this.core.context.logger.logError('不支持的ID', id);
                return undefined;
            }
            let faceType = 1;
            if (parsedFaceId >= 222) {
                faceType = 2;
            }
            if (face.AniStickerType) {
                faceType = 3;
            }
            return {
                elementType: ElementType.FACE,
                elementId: '',
                faceElement: {
                    faceIndex: parsedFaceId,
                    faceType,
                    faceText: face.QDes,
                    stickerId: face.AniStickerId,
                    stickerType: face.AniStickerType,
                    packId: face.AniStickerPackId,
                    sourceType: 1,
                    resultId: resultId?.toString(),
                    chainCount,
                },
            };
        },
        [OB11MessageDataType.mface]: async ({
            data: {
                emoji_package_id, emoji_id, key, summary,
            },
        }) => ({
            elementType: ElementType.MFACE,
            elementId: '',
            marketFaceElement: {
                emojiPackageId: emoji_package_id,
                emojiId: emoji_id,
                key,
                faceName: summary || '[商城表情]',
            },
        }),

        // File service
        [OB11MessageDataType.image]: async (sendMsg, context) => {
            return await this.core.apis.FileApi.createValidSendPicElement(
                context,
                (await this.handleOb11FileLikeMessage(sendMsg, context)).path,
                sendMsg.data.summary,
                sendMsg.data.sub_type,
            );
        },

        [OB11MessageDataType.file]: async (sendMsg, context) => {
            const { path, fileName } = await this.handleOb11FileLikeMessage(sendMsg, context);
            return await this.core.apis.FileApi.createValidSendFileElement(context, path, fileName);
        },

        [OB11MessageDataType.video]: async (sendMsg, context) => {
            const { path, fileName } = await this.handleOb11FileLikeMessage(sendMsg, context);

            let thumb = sendMsg.data.thumb;
            if (thumb) {
                const uri2LocalRes = await uriToLocalFile(this.core.NapCatTempPath, thumb);
                if (uri2LocalRes.success) {
                    thumb = uri2LocalRes.path;
                    context.deleteAfterSentFiles.push(thumb);
                }
            }

            return await this.core.apis.FileApi.createValidSendVideoElement(context, path, fileName, thumb);
        },

        [OB11MessageDataType.voice]: async (sendMsg, context) =>
            this.core.apis.FileApi.createValidSendPttElement(context,
                (await this.handleOb11FileLikeMessage(sendMsg, context)).path),

        [OB11MessageDataType.json]: async ({ data: { data } }) => ({
            elementType: ElementType.ARK,
            elementId: '',
            arkElement: {
                bytesData: typeof data === 'string' ? data : JSON.stringify(data),
                linkInfo: null,
                subElementType: null,
            },
        }),

        [OB11MessageDataType.dice]: async () => ({
            elementType: ElementType.FACE,
            elementId: '',
            faceElement: {
                faceIndex: FaceIndex.DICE,
                faceType: FaceType.AniSticke,
                faceText: '[骰子]',
                packId: '1',
                stickerId: '33',
                sourceType: 1,
                stickerType: 2,
                surpriseId: '',
                // "randomType": 1,
            },
        }),

        [OB11MessageDataType.rps]: async () => ({
            elementType: ElementType.FACE,
            elementId: '',
            faceElement: {
                faceIndex: FaceIndex.RPS,
                faceText: '[包剪锤]',
                faceType: FaceType.AniSticke,
                packId: '1',
                stickerId: '34',
                sourceType: 1,
                stickerType: 2,
                surpriseId: '',
                // "randomType": 1,
            },
        }),

        // Need signing
        [OB11MessageDataType.markdown]: async ({ data: { content } }) => ({
            elementType: ElementType.MARKDOWN,
            elementId: '',
            markdownElement: { content },
        }),

        [OB11MessageDataType.music]: async ({ data }, context) => {
            // 保留, 直到...找到更好的解决方案
            if (data.id !== undefined) {
                if (!['qq', '163', 'kugou', 'kuwo', 'migu'].includes(data.type)) {
                    this.core.context.logger.logError('音乐卡片type错误, 只支持qq、163、kugou、kuwo、migu，当前type:', data.type);
                    return undefined;
                }
            } else {
                if (!['qq', '163', 'kugou', 'kuwo', 'migu', 'custom'].includes(data.type)) {
                    this.core.context.logger.logError('音乐卡片type错误, 只支持qq、163、kugou、kuwo、migu、custom，当前type:', data.type);
                    return undefined;
                }
                if (!data.url) {
                    this.core.context.logger.logError('自定义音卡缺少参数url');
                    return undefined;
                }
                if (!data.image) {
                    this.core.context.logger.logError('自定义音卡缺少参数image');
                    return undefined;
                }
            }

            let postData: IdMusicSignPostData | CustomMusicSignPostData;
            if (data.id === undefined && data.content) {
                const { content, ...others } = data;
                postData = { singer: content, ...others };
            } else {
                postData = data;
            }
            let signUrl = this.obContext.configLoader.configData.musicSignUrl;
            if (!signUrl) {
                signUrl = 'https://ss.xingzhige.com/music_card/card';//感谢思思！已获思思许可 其余地方使用请自行询问
                //throw Error('音乐消息签名地址未配置');
            }
            try {
                const musicJson = await RequestUtil.HttpGetJson<string>(signUrl, 'POST', postData);
                return this.ob11ToRawConverters.json({
                    data: { data: musicJson },
                    type: OB11MessageDataType.json
                }, context);
            } catch (e) {
                this.core.context.logger.logError('生成音乐消息失败', e);
            }
            return undefined;
        },

        [OB11MessageDataType.node]: async () => undefined,

        [OB11MessageDataType.forward]: async ({ data }, context) => {
            // let id = data.id.toString();
            // let peer: Peer | undefined = context.peer;
            // if (isNumeric(id)) {
            //     let msgid = '';
            //     if (BigInt(data.id) > 2147483647n) {
            //         peer = MessageUnique.getPeerByMsgId(id)?.Peer;
            //         msgid = id;
            //     } else {
            //         let data = MessageUnique.getMsgIdAndPeerByShortId(parseInt(id));
            //         msgid = data?.MsgId ?? '';
            //         peer = data?.Peer;
            //     }
            // }
            const jsonData = ForwardMsgBuilder.fromResId(data.id);
            return this.ob11ToRawConverters.json({
                data: { data: JSON.stringify(jsonData) },
                type: OB11MessageDataType.json
            }, context);
        },

        [OB11MessageDataType.xml]: async () => undefined,

        [OB11MessageDataType.poke]: async () => undefined,

        [OB11MessageDataType.location]: async () => ({
            elementType: ElementType.SHARELOCATION,
            elementId: '',
            shareLocationElement: {
                text: '测试',
                ext: '',
            },
        }),

        [OB11MessageDataType.miniapp]: async () => undefined,

        [OB11MessageDataType.contact]: async ({ data: { type = 'qq', id } }, context) => {
            if (type === 'qq') {
                const arkJson = await this.core.apis.UserApi.getBuddyRecommendContactArkJson(id.toString(), '');
                return this.ob11ToRawConverters.json({
                    data: { data: arkJson.arkMsg },
                    type: OB11MessageDataType.json
                }, context);
            } else if (type === 'group') {
                const arkJson = await this.core.apis.GroupApi.getGroupRecommendContactArkJson(id.toString());
                return this.ob11ToRawConverters.json({
                    data: { data: arkJson.arkJson },
                    type: OB11MessageDataType.json
                }, context);
            }
            return undefined;
        }
    };

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }
    /**
     * 解析带有JSON标记的文本
     * @param text 要解析的文本
     * @returns 解析后的结果数组，每个元素包含类型(text或json)和内容
     */
    parseTextWithJson(text: string) {
        // 匹配<{...}>格式的JSON
        const regex = /<(\{.*?\})>/g;
        const parts: Array<{ type: 'text' | 'json', content: string | object }> = [];
        let lastIndex = 0;
        let match;

        // 查找所有匹配项
        while ((match = regex.exec(text)) !== null) {
            // 添加匹配前的文本
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.substring(lastIndex, match.index)
                });
            }

            // 添加JSON部分
            try {
                const jsonContent = JSON.parse(match[1] ?? '');
                parts.push({
                    type: 'json',
                    content: jsonContent
                });
            } catch (e) {
                // 如果JSON解析失败，作为普通文本处理
                parts.push({
                    type: 'text',
                    content: match[0]
                });
            }

            lastIndex = regex.lastIndex;
        }

        // 添加最后一部分文本
        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex)
            });
        }

        return parts;
    }

    async parsePrivateMsgEvent(msg: RawMessage, grayTipElement: GrayTipElement) {
        if (grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_JSON) {
            if (grayTipElement.jsonGrayTipElement.busiId == 1061) {
                const PokeEvent = await this.obContext.apis.FriendApi.parsePrivatePokeEvent(grayTipElement, Number(await this.core.apis.UserApi.getUinByUidV2(msg.peerUid)));
                if (PokeEvent) {
                    return PokeEvent;
                }
                ;
            } else if (grayTipElement.jsonGrayTipElement.busiId == 19324 && msg.peerUid !== '') {
                return new OB11FriendAddNoticeEvent(this.core, Number(await this.core.apis.UserApi.getUinByUidV2(msg.peerUid)));
            }
        }
        return;
    }

    private async getMultiMessages(msg: RawMessage, parentMsgPeer: Peer) {
        //判断是否在合并消息内
        msg.parentMsgIdList = msg.parentMsgIdList ?? [];
        //首次列表不存在则开始创建
        msg.parentMsgIdList.push(msg.msgId);
        //拉取下级消息
        if (msg.parentMsgIdList[0]) {
            return (await this.core.apis.MsgApi.getMultiMsg(
                parentMsgPeer,
                msg.parentMsgIdList[0],
                msg.msgId
            ))?.msgList;
        }
        return undefined;
    }

    private async parseMultiMessageContent(
        multiMsgs: RawMessage[],
        parentMsgPeer: Peer,
        parentMsgIdList: string[]
    ) {
        const parsed = await Promise.all(multiMsgs.map(async msg => {
            msg.parentMsgPeer = parentMsgPeer;
            msg.parentMsgIdList = parentMsgIdList;
            msg.id = MessageUnique.createUniqueMsgId(parentMsgPeer, msg.msgId);
            //该ID仅用查看 无法调用
            return await this.parseMessage(msg, 'array', true);
        }));
        return parsed.filter(item => item !== undefined);
    }

    async parseMessage(
        msg: RawMessage,
        messagePostFormat: string,
        parseMultMsg: boolean = true,
        disableGetUrl: boolean = false,
        quick_reply: boolean = false
    ) {
        if (messagePostFormat === 'string') {
            return (await this.parseMessageV2(msg, parseMultMsg, disableGetUrl, quick_reply))?.stringMsg;
        }
        return (await this.parseMessageV2(msg, parseMultMsg, disableGetUrl, quick_reply))?.arrayMsg;
    }

    async parseMessageV2(
        msg: RawMessage,
        parseMultMsg: boolean = true,
        disableGetUrl: boolean = false,
        quick_reply: boolean = false
    ) {
        if (msg.senderUin == '0' || msg.senderUin == '') return;
        if (msg.peerUin == '0' || msg.peerUin == '') return;

        const resMsg = this.initializeMessage(msg);

        if (this.core.selfInfo.uin == msg.senderUin) {
            resMsg.message_sent_type = 'self';
        }

        if (msg.chatType == ChatType.KCHATTYPEGROUP) {
            await this.handleGroupMessage(resMsg, msg);
        } else if (msg.chatType == ChatType.KCHATTYPEC2C) {
            await this.handlePrivateMessage(resMsg, msg);
        } else if (msg.chatType == ChatType.KCHATTYPETEMPC2CFROMGROUP) {
            await this.handleTempGroupMessage(resMsg, msg);
        } else {
            return undefined;
        }

        const validSegments = await this.parseMessageSegments(msg, parseMultMsg, disableGetUrl, quick_reply);
        resMsg.message = validSegments;
        resMsg.raw_message = validSegments.map(msg => encodeCQCode(msg)).join('').trim();

        const stringMsg = await this.convertArrayToStringMessage(resMsg);
        return { stringMsg, arrayMsg: resMsg };
    }

    private initializeMessage(msg: RawMessage): OB11Message {
        return {
            self_id: parseInt(this.core.selfInfo.uin),
            user_id: parseInt(msg.senderUin),
            time: parseInt(msg.msgTime) || Date.now(),
            message_id: msg.id!,
            message_seq: msg.id!,
            real_id: msg.id!,
            real_seq: msg.msgSeq,
            message_type: msg.chatType == ChatType.KCHATTYPEGROUP ? 'group' : 'private',
            sender: {
                user_id: +(msg.senderUin ?? 0),
                nickname: msg.sendNickName,
                card: msg.sendMemberName ?? '',
            },
            raw_message: '',
            font: 14,
            sub_type: 'friend',
            message: [],
            message_format: 'array',
            post_type: this.core.selfInfo.uin == msg.senderUin ? EventType.MESSAGE_SENT : EventType.MESSAGE,
        };
    }

    private async handleGroupMessage(resMsg: OB11Message, msg: RawMessage) {
        resMsg.sub_type = 'normal';
        resMsg.group_id = parseInt(msg.peerUin);
        resMsg.group_name = msg.peerName;
        let member = await this.core.apis.GroupApi.getGroupMember(msg.peerUin, msg.senderUin);
        if (!member) member = await this.core.apis.GroupApi.getGroupMember(msg.peerUin, msg.senderUin);
        if (member) {
            resMsg.sender.role = OB11Construct.groupMemberRole(member.role);
            resMsg.sender.nickname = member.nick;
        }
    }

    private async handlePrivateMessage(resMsg: OB11Message, msg: RawMessage) {
        resMsg.sub_type = 'friend';
        if (await this.core.apis.FriendApi.isBuddy(msg.senderUid)) {
            const nickname = (await this.core.apis.UserApi.getCoreAndBaseInfo([msg.senderUid])).get(msg.senderUid)?.coreInfo.nick;
            if (nickname) {
                resMsg.sender.nickname = nickname;
                return;
            }
        }
        resMsg.sender.nickname = (await this.core.apis.UserApi.getUserDetailInfo(msg.senderUid)).nick;
    }

    private async handleTempGroupMessage(resMsg: OB11Message, msg: RawMessage) {
        resMsg.sub_type = 'group';
        const ret = await this.core.apis.MsgApi.getTempChatInfo(ChatType.KCHATTYPETEMPC2CFROMGROUP, msg.senderUid);
        if (ret.result === 0) {
            const member = await this.core.apis.GroupApi.getGroupMember(msg.peerUin, msg.senderUin);
            resMsg.group_id = parseInt(ret.tmpChatInfo!.groupCode);
            resMsg.sender.nickname = member?.nick ?? member?.cardName ?? '临时会话';
            resMsg.temp_source = 0;
        } else {
            resMsg.group_id = 284840486;
            resMsg.temp_source = 0;
            resMsg.sender.nickname = '临时会话';
        }
    }

    private async parseMessageSegments(msg: RawMessage, parseMultMsg: boolean, disableGetUrl: boolean = false, quick_reply: boolean = false): Promise<OB11MessageData[]> {
        const msgSegments = await Promise.allSettled(msg.elements.map(
            async (element) => {
                for (const key in element) {
                    if (keyCanBeParsed(key, this.rawToOb11Converters) && element[key]) {
                        const converters = this.rawToOb11Converters[key] as (
                            element: Exclude<MessageElement[keyof RawToOb11Converters], null | undefined>,
                            msg: RawMessage,
                            elementWrapper: MessageElement,
                            context: RecvMessageContext
                        ) => Promise<OB11MessageData | null>;
                        const parsedElement = await converters?.(
                            element[key],
                            msg,
                            element,
                            { parseMultMsg, disableGetUrl, quick_reply }
                        );
                        if (key === 'faceElement' && !parsedElement) {
                            return null;
                        }
                        return parsedElement;
                    }
                }
                return;
            },
        ));

        return msgSegments.filter(entry => {
            if (entry.status === 'fulfilled') {
                return !!entry.value;
            } else {
                this.core.context.logger.logError('消息段解析失败', entry.reason);
                return false;
            }
        }).map((entry) => (<PromiseFulfilledResult<OB11MessageData>>entry).value).filter(value => value != null);
    }

    private async convertArrayToStringMessage(originMsg: OB11Message): Promise<OB11Message> {
        const msg = structuredClone(originMsg);
        msg.message_format = 'string';
        msg.message = msg.raw_message;
        return msg;
    }

    async importArrayTostringMsg(originMsg: OB11Message) {
        const msg = structuredClone(originMsg);
        msg.message_format = 'string';
        msg.message = msg.raw_message;
        return msg;
    }

    async createSendElements(
        messageData: OB11MessageData[],
        peer: Peer,
        ignoreTypes: OB11MessageDataType[] = [],
    ) {
        const deleteAfterSentFiles: string[] = [];
        const callResultList: Array<Promise<SendMessageElement | undefined>> = [];
        for (const sendMsg of messageData) {
            if (ignoreTypes.includes(sendMsg.type)) {
                continue;
            }
            const converter = this.ob11ToRawConverters[sendMsg.type] as (
                sendMsg: Extract<OB11MessageData, { type: OB11MessageData['type'] }>,
                context: SendMessageContext,
            ) => Promise<SendMessageElement | undefined>;
            const callResult = converter(
                sendMsg,
                { peer, deleteAfterSentFiles },
            )?.catch(undefined);
            callResultList.push(callResult);
        }
        const ret = await Promise.all(callResultList);
        const sendElements: SendMessageElement[] = ret.filter(ele => !!ele);
        return { sendElements, deleteAfterSentFiles };
    }

    async sendMsgWithOb11UniqueId(peer: Peer, sendElements: SendMessageElement[], deleteAfterSentFiles: string[]) {
        if (!sendElements.length) {
            throw new Error('消息体无法解析, 请检查是否发送了不支持的消息类型');
        }

        const calculateTotalSize = async (elements: SendMessageElement[]): Promise<number> => {
            const sizePromises = elements.map(async element => {
                switch (element.elementType) {
                    case ElementType.PTT:
                        return (await fsPromise.stat(element.pttElement.filePath)).size;
                    case ElementType.FILE:
                        return (await fsPromise.stat(element.fileElement.filePath)).size;
                    case ElementType.VIDEO:
                        return (await fsPromise.stat(element.videoElement.filePath)).size;
                    case ElementType.PIC:
                        return (await fsPromise.stat(element.picElement.sourcePath)).size;
                    default:
                        return 0;
                }
            });
            const sizes = await Promise.all(sizePromises);
            return sizes.reduce((total, size) => total + size, 0);
        };

        const totalSize = await calculateTotalSize(sendElements).catch(e => {
            this.core.context.logger.logError('发送消息计算预计时间异常', e);
            return 0;
        });

        const timeout = 10000 + (totalSize / 1024 / 256 * 1000);
        try {
            const returnMsg = await this.core.apis.MsgApi.sendMsg(peer, sendElements, timeout);
            if (!returnMsg) throw new Error('发送消息失败');
            returnMsg.id = MessageUnique.createUniqueMsgId({
                chatType: peer.chatType,
                guildId: '',
                peerUid: peer.peerUid,
            }, returnMsg.msgId);
            return returnMsg;
        } catch (error) {
            throw new Error((error as Error).message);
        } finally {
            cleanTaskQueue.addFiles(deleteAfterSentFiles, timeout);
            // setTimeout(async () => {
            //     const deletePromises = deleteAfterSentFiles.map(async file => {
            //         try {
            //             if (await fsPromise.access(file, constants.W_OK).then(() => true).catch(() => false)) {
            //                 await fsPromise.unlink(file);
            //             }
            //         } catch (e) {
            //             this.core.context.logger.logError('发送消息删除文件失败', e);
            //         }
            //     });
            //     await Promise.all(deletePromises);
            // }, 60000);
        }
    }

    private async handleOb11FileLikeMessage(
        { data: inputdata }: OB11MessageFileBase,
        { deleteAfterSentFiles }: SendMessageContext
    ) {
        let realUri = [inputdata.url, inputdata.file, inputdata.path].find(uri => uri && uri.trim()) ?? '';
        if (!realUri) {
            this.core.context.logger.logError('文件消息缺少参数', inputdata);
            throw new Error('文件消息缺少参数');
        }
        realUri = await this.handleObfuckName(realUri) ?? realUri;
        try {
            const { path, fileName, errMsg, success } = await uriToLocalFile(this.core.NapCatTempPath, realUri);
            if (!success) {
                this.core.context.logger.logError('文件处理失败', errMsg);
                throw new Error('文件处理失败: ' + errMsg);
            }
            deleteAfterSentFiles.push(path);
            return { path, fileName: inputdata.name ?? fileName };
        } catch (e: unknown) {
            throw new Error((e as Error).message);
        }
    }

    async handleObfuckName(name: string) {
        const contextMsgFile = FileNapCatOneBotUUID.decode(name);
        if (contextMsgFile && contextMsgFile.msgId && contextMsgFile.elementId) {
            const { peer, msgId, elementId } = contextMsgFile;
            const rawMessage = (await this.core.apis.MsgApi.getMsgsByMsgId(peer, [msgId]))?.msgList.find(msg => msg.msgId === msgId);
            const mixElement = rawMessage?.elements.find(e => e.elementId === elementId);
            const mixElementInner = mixElement?.videoElement ?? mixElement?.fileElement ?? mixElement?.pttElement ?? mixElement?.picElement;
            if (!mixElementInner) throw new Error('element not found');
            let url = '';
            if (mixElement?.picElement && rawMessage) {
                const tempData =
                    await this.obContext.apis.MsgApi.rawToOb11Converters.picElement?.(mixElement?.picElement, rawMessage, mixElement, { parseMultMsg: false, disableGetUrl: false, quick_reply: false }) as OB11MessageImage | undefined;
                url = tempData?.data.url ?? '';
            }
            if (mixElement?.videoElement && rawMessage) {
                const tempData =
                    await this.obContext.apis.MsgApi.rawToOb11Converters.videoElement?.(mixElement?.videoElement, rawMessage, mixElement, { parseMultMsg: false, disableGetUrl: false, quick_reply: false }) as OB11MessageVideo | undefined;
                url = tempData?.data.url ?? '';
            }
            return url !== '' ? url : await this.core.apis.FileApi.downloadMedia(msgId, peer.chatType, peer.peerUid, elementId, '', '');
        }
        return undefined;
    }

    groupChangDecreseType2String(type: number): GroupDecreaseSubType {
        switch (type) {
            case 130:
                return 'leave';
            case 131:
                return 'kick';
            case 3:
                return 'kick_me';
            case 129:
                return 'disband';
            default:
                return 'kick';
        }
    }

    async waitGroupNotify(groupUin: string, memberUid?: string, operatorUid?: string) {
        const groupRole = this.core.apis.GroupApi.groupMemberCache.get(groupUin)?.get(this.core.selfInfo.uid.toString())?.role;
        const isAdminOrOwner = groupRole === 3 || groupRole === 4;
        if (isAdminOrOwner && !operatorUid) {
            let dataNotify: GroupNotify | undefined;
            await this.core.eventWrapper.registerListen('NodeIKernelGroupListener/onGroupNotifiesUpdated',
                (_doubt, notifies) => {
                    for (const notify of notifies) {
                        if (notify.group.groupCode === groupUin && notify.user1.uid === memberUid) {
                            dataNotify = notify;
                            return true;
                        }
                    }
                    return false;
                }, 1, 1000).catch(() => undefined);
            if (dataNotify) {
                return !dataNotify.actionUser.uid ? dataNotify.user2.uid : dataNotify.actionUser.uid;
            }
        }

        return operatorUid;
    }

    async parseSysMessage(msg: number[]) {
        const SysMessage = new NapProtoMsg(PushMsgBody).decode(Uint8Array.from(msg));
        // 邀请需要解grayTipElement
        if (SysMessage.contentHead.type == 33 && SysMessage.body?.msgContent) {
            const groupChange = new NapProtoMsg(GroupChange).decode(SysMessage.body.msgContent);
            await this.core.apis.GroupApi.refreshGroupMemberCache(groupChange.groupUin.toString(), true);
            const operatorUid = await this.waitGroupNotify(
                groupChange.groupUin.toString(),
                groupChange.memberUid,
                groupChange.operatorInfo ? new TextDecoder('utf-8').decode(groupChange.operatorInfo) : undefined
            );
            return new OB11GroupIncreaseEvent(
                this.core,
                groupChange.groupUin,
                groupChange.memberUid ? +await this.core.apis.UserApi.getUinByUidV2(groupChange.memberUid) : 0,
                operatorUid ? +await this.core.apis.UserApi.getUinByUidV2(operatorUid) : 0,
                groupChange.decreaseType == 131 ? 'invite' : 'approve',
            );

        } else if (SysMessage.contentHead.type == 34 && SysMessage.body?.msgContent) {
            const groupChange = new NapProtoMsg(GroupChange).decode(SysMessage.body.msgContent);

            let operator_uid_parse: string | undefined = undefined;
            if (groupChange.operatorInfo) {
                // 先判断是否可能是protobuf（自身被踢出或以0a开头）
                if (groupChange.decreaseType === 3 || Buffer.from(groupChange.operatorInfo).toString('hex').startsWith('0a')) {
                    // 可能是protobuf，尝试解析
                    try {
                        operator_uid_parse = new NapProtoMsg(GroupChangeInfo).decode(groupChange.operatorInfo).operator?.operatorUid;
                    } catch (error) {
                        // protobuf解析失败，fallback到字符串解析
                        try {
                            const decoded = new TextDecoder('utf-8').decode(groupChange.operatorInfo);
                            // 检查是否包含非ASCII字符，如果包含则丢弃
                            const isAsciiOnly = [...decoded].every(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126);
                            operator_uid_parse = isAsciiOnly ? decoded : '';
                        } catch (e2) {
                            operator_uid_parse = '';
                        }
                    }
                } else {
                    // 直接进行字符串解析
                    try {
                        const decoded = new TextDecoder('utf-8').decode(groupChange.operatorInfo);
                        // 检查是否包含非ASCII字符，如果包含则丢弃
                        const isAsciiOnly = [...decoded].every(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126);
                        operator_uid_parse = isAsciiOnly ? decoded : '';
                    } catch (e) {
                        operator_uid_parse = '';
                    }
                }
            }

            const operatorUid = await this.waitGroupNotify(
                groupChange.groupUin.toString(),
                groupChange.memberUid,
                operator_uid_parse
            );
            if (groupChange.memberUid === this.core.selfInfo.uid) {
                setTimeout(() => {
                    this.core.apis.GroupApi.groupMemberCache.delete(groupChange.groupUin.toString());
                }, 5000);
                // 自己被踢了 5S后回收
            } else {
                await this.core.apis.GroupApi.refreshGroupMemberCache(groupChange.groupUin.toString(), true);
            }
            return new OB11GroupDecreaseEvent(
                this.core,
                groupChange.groupUin,
                groupChange.memberUid ? +await this.core.apis.UserApi.getUinByUidV2(groupChange.memberUid) : 0,
                operatorUid ? +await this.core.apis.UserApi.getUinByUidV2(operatorUid) : 0,
                this.groupChangDecreseType2String(groupChange.decreaseType),
            );
        } else if (SysMessage.contentHead.type == 44 && SysMessage.body?.msgContent) {
            const groupAmin = new NapProtoMsg(GroupAdmin).decode(SysMessage.body.msgContent);
            await this.core.apis.GroupApi.refreshGroupMemberCache(groupAmin.groupUin.toString(), true);
            let enabled = false;
            let uid = '';
            if (groupAmin.body.extraEnable != null) {
                uid = groupAmin.body.extraEnable.adminUid;
                enabled = true;
            } else if (groupAmin.body.extraDisable != null) {
                uid = groupAmin.body.extraDisable.adminUid;
                enabled = false;
            }
            return new OB11GroupAdminNoticeEvent(
                this.core,
                groupAmin.groupUin,
                +await this.core.apis.UserApi.getUinByUidV2(uid),
                enabled ? 'set' : 'unset'
            );
        } else if (SysMessage.contentHead.type == 87 && SysMessage.body?.msgContent) {
            const groupInvite = new NapProtoMsg(GroupInvite).decode(SysMessage.body.msgContent);
            let request_seq = '';
            try {
                await this.core.eventWrapper.registerListen('NodeIKernelMsgListener/onRecvMsg', (msgs) => {
                    for (const msg of msgs) {
                        if (msg.senderUid === groupInvite.invitorUid && msg.msgType === 11) {
                            const jumpUrl = JSON.parse(msg.elements.find(e => e.elementType === 10)?.arkElement?.bytesData ?? '').meta?.news?.jumpUrl;
                            const jumpUrlParams = new URLSearchParams(jumpUrl);
                            const groupcode = jumpUrlParams.get('groupcode');
                            const receiveruin = jumpUrlParams.get('receiveruin');
                            const msgseq = jumpUrlParams.get('msgseq');
                            request_seq = msgseq ?? '';
                            if (groupcode === groupInvite.groupUin.toString() && receiveruin === this.core.selfInfo.uin) {
                                return true;
                            }
                        }
                    }
                    return false;
                }, 1, 1000);
            } catch {
                request_seq = '';
            }
            // 未拉取到seq
            if (request_seq === '') {
                return;
            }
            // 创建个假的
            this.notifyGroupInvite.put(request_seq, {
                seq: request_seq,
                type: 1,
                group: {
                    groupCode: groupInvite.groupUin.toString(),
                    groupName: '',
                },
                user1: {
                    uid: groupInvite.invitorUid,
                    nickName: '',
                },
                user2: {
                    uid: this.core.selfInfo.uid,
                    nickName: '',
                },
                actionUser: {
                    uid: groupInvite.invitorUid,
                    nickName: '',
                },
                actionTime: Date.now().toString(),
                postscript: '',
                repeatSeqs: [],
                warningTips: '',
                invitationExt: {
                    srcType: 1,
                    groupCode: groupInvite.groupUin.toString(),
                    waitStatus: 1,
                },
                status: 1
            });
            return new OB11GroupRequestEvent(
                this.core,
                +groupInvite.groupUin,
                +await this.core.apis.UserApi.getUinByUidV2(groupInvite.invitorUid),
                'invite',
                '',
                request_seq
            );
        } else if (SysMessage.contentHead.type == 528 && SysMessage.contentHead.subType == 39 && SysMessage.body?.msgContent) {
            return await this.obContext.apis.UserApi.parseLikeEvent(SysMessage.body?.msgContent);
        }
        // else if (SysMessage.contentHead.type == 732 && SysMessage.contentHead.subType == 16 && SysMessage.body?.msgContent) {
        //     let data_wrap = PBString(2);
        //     let user_wrap = PBUint64(5);
        //     let group_wrap = PBUint64(4);

        //     ProtoBuf(class extends ProtoBufBase {
        //         group = group_wrap;
        //         content = ProtoBufIn(5, { data: data_wrap, user: user_wrap });
        //     }).decode(SysMessage.body?.msgContent.slice(7));
        //     let xml_data = UnWrap(data_wrap);
        //     let group = UnWrap(group_wrap).toString();
        //     //let user = UnWrap(user_wrap).toString();
        //     const parsedParts = this.parseTextWithJson(xml_data);
        //     //解析JSON
        //     if (parsedParts[1] && parsedParts[3]) {
        //         let set_user_id: string = (parsedParts[1].content as { data: string }).data;
        //         let uid = await this.core.apis.UserApi.getUidByUinV2(set_user_id);
        //         let new_title: string = (parsedParts[3].content as { text: string }).text;
        //         console.log(this.core.apis.GroupApi.groupMemberCache.get(group)?.get(uid)?.memberSpecialTitle, new_title)
        //         if (this.core.apis.GroupApi.groupMemberCache.get(group)?.get(uid)?.memberSpecialTitle == new_title) {
        //             return;
        //         }
        //         await this.core.apis.GroupApi.refreshGroupMemberCachePartial(group, uid);
        //         //let json_data_1_url_search = new URL((parsedParts[3].content as { url: string }).url).searchParams;
        //         //let is_new: boolean = json_data_1_url_search.get('isnew') === '1';

        //         //console.log(group, set_user_id, is_new, new_title);
        //         return new GroupMemberTitle(
        //             this.core,
        //             +group,
        //             +set_user_id,
        //             new_title
        //         );
        //     }
        // }
        return undefined;
    }
}
