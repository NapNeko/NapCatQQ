import { FileNapCatOneBotUUID } from '@/common/helper';
import { MessageUnique } from '@/common/message-unique';
import { pathToFileURL } from 'node:url';
import {
    NTMsgAtType,
    ChatType,
    CustomMusicSignPostData,
    ElementType,
    FaceIndex,
    IdMusicSignPostData,
    MessageElement,
    NapCatCore,
    NTGrayTipElementSubTypeV2,
    Peer,
    RawMessage,
    SendMessageElement,
    SendTextElement,
    FaceType,
    GrayTipElement,
} from '@/core';
import faceConfig from '@/core/external/face_config.json';
import { NapCatOneBot11Adapter, OB11Message, OB11MessageData, OB11MessageDataType, OB11MessageFileBase, OB11MessageForward, } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { EventType } from '@/onebot/event/OneBotEvent';
import { encodeCQCode } from '@/onebot/helper/cqcode';
import { uri2local } from '@/common/file';
import { RequestUtil } from '@/common/request';
import fsPromise, { constants } from 'node:fs/promises';
import { OB11FriendAddNoticeEvent } from '@/onebot/event/notice/OB11FriendAddNoticeEvent';
import { ForwardMsgBuilder } from "@/common/forward-msg-builder";
import { GroupChange, PushMsgBody } from "@/core/packet/transformer/proto";
import { NapProtoMsg } from '@napneko/nap-proto-core';
import { OB11GroupIncreaseEvent } from '../event/notice/OB11GroupIncreaseEvent';
import { OB11GroupDecreaseEvent, GroupDecreaseSubType } from '../event/notice/OB11GroupDecreaseEvent';

type RawToOb11Converters = {
    [Key in keyof MessageElement as Key extends `${string}Element` ? Key : never]: (
        element: Exclude<MessageElement[Key], null | undefined>,
        msg: RawMessage,
        elementWrapper: MessageElement,
        context: RecvMessageContext
    ) => PromiseLike<OB11MessageData | null>
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
    parseMultMsg: boolean
}

function keyCanBeParsed(key: string, parser: RawToOb11Converters): key is keyof RawToOb11Converters {
    return key in parser;
}

export class OneBotMsgApi {
    obContext: NapCatOneBot11Adapter;
    core: NapCatCore;

    rawToOb11Converters: RawToOb11Converters = {
        textElement: async element => {
            if (element.atType === NTMsgAtType.ATTYPEUNKNOWN) {
                let text = element.content;
                if (!text.trim()) {
                    return null;
                }
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
                    const { atNtUid /* content */ } = element;
                    let atQQ = element.atUid;
                    if (!atQQ || atQQ === '0') {
                        atQQ = await this.core.apis.UserApi.getUinByUidV2(atNtUid);
                    }
                    if (atQQ) {
                        qq = atQQ as `${number}`;
                    }
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

        picElement: async (element, msg, elementWrapper) => {
            try {
                const peer = {
                    chatType: msg.chatType,
                    peerUid: msg.peerUid,
                    guildId: '',
                };
                const encodedFileId = FileNapCatOneBotUUID.encode(peer, msg.msgId, elementWrapper.elementId, element.fileUuid, "." + element.fileName);
                return {
                    type: OB11MessageDataType.image,
                    data: {
                        summary: element.summary,
                        file: encodedFileId,
                        sub_type: element.picSubType,
                        file_id: encodedFileId,
                        url: await this.core.apis.FileApi.getImageUrl(element),
                        path: element.filePath,
                        file_size: element.fileSize,
                        file_unique: element.md5HexStr ?? element.fileName,
                    },
                };
            } catch (e: any) {
                this.core.context.logger.logError('获取图片url失败', e.stack);
                return null;
            }
        },

        fileElement: async (element, msg, elementWrapper) => {
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };
            return {
                type: OB11MessageDataType.file,
                data: {
                    file: element.fileName,
                    path: element.filePath,
                    url: pathToFileURL(element.filePath).href,
                    file_id: FileNapCatOneBotUUID.encode(peer, msg.msgId, elementWrapper.elementId, element.fileUuid, "." + element.fileName),
                    file_size: element.fileSize,
                    file_unique: element.fileMd5 ?? element.fileSha ?? element.fileName,
                },
            };
        },

        faceElement: async element => {
            const faceIndex = element.faceIndex;
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
                        id: element.faceIndex.toString()
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
            return {
                type: OB11MessageDataType.image,
                data: {
                    summary: _.faceName, // 商城表情名称
                    file: 'marketface',
                    file_id: FileNapCatOneBotUUID.encode(peer, msg.msgId, elementWrapper.elementId, "", "." + _.key + ".jpg"),
                    path: url,
                    url: url,
                    key: _.key,
                    emoji_id: _.emojiId,
                    emoji_package_id: _.emojiPackageId,
                    file_unique: _.key
                },
            };
        },

        replyElement: async (element, msg) => {
            const records = msg.records.find(msgRecord => msgRecord.msgId === element?.sourceMsgIdInRecords);
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };
            if (!records || !element.replyMsgTime || !element.senderUidStr) {
                this.core.context.logger.logError('似乎是旧版客户端,获取不到引用的消息', element.replayMsgSeq);
                return null;
            }

            const createReplyData = (msgId: string): OB11MessageData => ({
                type: OB11MessageDataType.reply,
                data: {
                    id: MessageUnique.createUniqueMsgId(peer, msgId).toString(),
                },
            });

            if (records.peerUin === '284840486' || records.peerUin === '1094950020') {
                return createReplyData(records.msgId);
            }
            let replyMsgList = (await this.core.apis.MsgApi.queryMsgsWithFilterExWithSeqV2(peer, element.replayMsgSeq, records.msgTime, [element.senderUidStr])).msgList;
            let replyMsg = replyMsgList.find(msg => msg.msgRandom === records.msgRandom);

            if (!replyMsg || records.msgRandom !== replyMsg.msgRandom) {
                this.core.context.logger.logError(
                    '筛选结果,筛选消息失败,将使用Fallback-1 Seq: ',
                    element.replayMsgSeq,
                    ',消息长度:',
                    replyMsgList.length
                );
                replyMsgList = (await this.core.apis.MsgApi.getMsgsBySeqAndCount(peer, element.replayMsgSeq, 1, true, true)).msgList;
                replyMsg = replyMsgList.find(msg => msg.msgRandom === records.msgRandom);
            }

            if (!replyMsg || records.msgRandom !== replyMsg.msgRandom) {
                this.core.context.logger.logWarn(
                    '筛选消息失败,将使用Fallback-2 Seq:',
                    element.replayMsgSeq,
                    ',消息长度:',
                    replyMsgList.length
                );
                replyMsgList = (await this.core.apis.MsgApi.queryMsgsWithFilterExWithSeqV3(peer, element.replayMsgSeq, [element.senderUidStr])).msgList;
                replyMsg = replyMsgList.find(msg => msg.msgRandom === records.msgRandom);
            }



            // 丢弃该消息段
            if (!replyMsg || records.msgRandom !== replyMsg.msgRandom) {
                this.core.context.logger.logError(
                    '最终筛选结果,筛选消息失败,获取不到引用的消息 Seq: ',
                    element.replayMsgSeq,
                    ',消息长度:',
                    replyMsgList.length
                );
                return null;
            }
            return createReplyData(replyMsg.msgId);
        },

        videoElement: async (element, msg, elementWrapper) => {
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
                } catch (error) {
                    this.core.context.logger.logWarn('合并获取视频 URL 失败');
                }
            } else {
                try {
                    videoUrlWrappers = await this.core.apis.FileApi.getVideoUrl({
                        chatType: msg.chatType,
                        peerUid: msg.peerUid,
                        guildId: '0',
                    }, msg.msgId, elementWrapper.elementId);
                } catch (error) {
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
            if (!videoDownUrl) {
                videoDownUrl = element.filePath;
            }
            const fileCode = FileNapCatOneBotUUID.encode(peer, msg.msgId, elementWrapper.elementId, "", "." + element.fileName);
            return {
                type: OB11MessageDataType.video,
                data: {
                    file: fileCode,
                    path: videoDownUrl,
                    url: videoDownUrl ?? pathToFileURL(element.filePath).href,
                    file_id: fileCode,
                    file_size: element.fileSize,
                    file_unique: element.videoMd5 ?? element.thumbMd5 ?? element.fileName,
                },
            };
        },

        pttElement: async (element, msg, elementWrapper) => {
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };
            const fileCode = FileNapCatOneBotUUID.encode(peer, msg.msgId, elementWrapper.elementId, "", "." + element.fileName);
            return {
                type: OB11MessageDataType.voice,
                data: {
                    file: fileCode,
                    path: element.filePath,
                    url: pathToFileURL(element.filePath).href,
                    file_id: fileCode,
                    file_size: element.fileSize,
                    file_unique: element.fileUuid
                },
            };
        },

        multiForwardMsgElement: async (_, msg, wrapper, context) => {
            const parentMsgPeer = msg.parentMsgPeer ?? {
                chatType: msg.chatType,
                guildId: '',
                peerUid: msg.peerUid,
            };
            const multiMsgs = await this.getMultiMessages(msg, parentMsgPeer);
            // 拉取失败则跳过
            if (!multiMsgs) return null;
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
                    },
                } :
                undefined;
        },

        [OB11MessageDataType.face]: async ({ data: { id } }) => {
            let parsedFaceId = +id;
            // 从face_config.json中获取表情名称
            const sysFaces = faceConfig.sysface;
            const face: any = sysFaces.find((systemFace) => systemFace.QSid === parsedFaceId.toString());
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
                const uri2LocalRes = await uri2local(this.core.NapCatTempPath, thumb);
                if (uri2LocalRes.success) thumb = uri2LocalRes.path;
            }
            return await this.core.apis.FileApi.createValidSendVideoElement(context, path, fileName, thumb);
        },

        [OB11MessageDataType.voice]: async (sendMsg, context) =>
            this.core.apis.FileApi.createValidSendPttElement(
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
                const musicJson = await RequestUtil.HttpGetJson<any>(signUrl, 'POST', postData);
                return this.ob11ToRawConverters.json({
                    data: { data: musicJson },
                    type: OB11MessageDataType.json
                }, context);
            } catch (e) {
                this.core.context.logger.logError('生成音乐消息失败', e);
            }
        },

        [OB11MessageDataType.node]: async () => undefined,

        [OB11MessageDataType.forward]: async ({ data }, context) => {
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

        [OB11MessageDataType.contact]: async ({ data: { type = "qq", id } }, context) => {
            if (type === "qq") {
                const arkJson = await this.core.apis.UserApi.getBuddyRecommendContactArkJson(id.toString(), '');
                return this.ob11ToRawConverters.json({
                    data: { data: arkJson.arkMsg },
                    type: OB11MessageDataType.json
                }, context);
            } else if (type === "group") {
                const arkJson = await this.core.apis.GroupApi.getGroupRecommendContactArkJson(id.toString());
                return this.ob11ToRawConverters.json({
                    data: { data: arkJson.arkJson },
                    type: OB11MessageDataType.json
                }, context);
            }
        }
    };

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }

    async parsePrivateMsgEvent(msg: RawMessage, grayTipElement: GrayTipElement) {
        if (grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_JSON) {
            if (grayTipElement.jsonGrayTipElement.busiId == 1061) {
                const PokeEvent = await this.obContext.apis.FriendApi.parsePrivatePokeEvent(grayTipElement);
                if (PokeEvent) { return PokeEvent; };
            } else if (grayTipElement.jsonGrayTipElement.busiId == 19324 && msg.peerUid !== '') {
                return new OB11FriendAddNoticeEvent(this.core, Number(await this.core.apis.UserApi.getUinByUidV2(msg.peerUid)));
            }
        }
    }

    private async getMultiMessages(msg: RawMessage, parentMsgPeer: Peer) {
        //判断是否在合并消息内
        msg.parentMsgIdList = msg.parentMsgIdList ?? [];
        //首次列表不存在则开始创建
        msg.parentMsgIdList.push(msg.msgId);
        //拉取下级消息
        return (await this.core.apis.MsgApi.getMultiMsg(
            parentMsgPeer,
            msg.parentMsgIdList[0],
            msg.msgId
        ))?.msgList;
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
        parseMultMsg: boolean = true
    ) {
        if (messagePostFormat === 'string') {
            return (await this.parseMessageV2(msg, parseMultMsg))?.stringMsg;
        }
        return (await this.parseMessageV2(msg, parseMultMsg))?.arrayMsg;
    }

    async parseMessageV2(
        msg: RawMessage,
        parseMultMsg: boolean = true
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

        const validSegments = await this.parseMessageSegments(msg, parseMultMsg);
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
        let member = await this.core.apis.GroupApi.getGroupMember(msg.peerUin, msg.senderUin);
        if (!member) member = await this.core.apis.GroupApi.getGroupMember(msg.peerUin, msg.senderUin);
        if (member) {
            resMsg.sender.role = OB11Construct.groupMemberRole(member.role);
            resMsg.sender.nickname = member.nick;
        }
    }

    private async handlePrivateMessage(resMsg: OB11Message, msg: RawMessage) {
        resMsg.sub_type = 'friend';
        resMsg.sender.nickname = (await this.core.apis.UserApi.getUserDetailInfo(msg.senderUid)).nick;
    }

    private async handleTempGroupMessage(resMsg: OB11Message, msg: RawMessage) {
        resMsg.sub_type = 'group';
        const ret = await this.core.apis.MsgApi.getTempChatInfo(ChatType.KCHATTYPETEMPC2CFROMGROUP, msg.senderUid);
        if (ret.result === 0) {
            const member = await this.core.apis.GroupApi.getGroupMember(msg.peerUin, msg.senderUin);
            resMsg.group_id = parseInt(ret.tmpChatInfo!.groupCode);
            resMsg.sender.nickname = member?.nick ?? member?.cardName ?? '临时会话';
            resMsg.temp_source = resMsg.group_id;
        } else {
            resMsg.group_id = 284840486;
            resMsg.temp_source = resMsg.group_id;
            resMsg.sender.nickname = '临时会话';
        }
    }

    private async parseMessageSegments(msg: RawMessage, parseMultMsg: boolean): Promise<OB11MessageData[]> {
        const msgSegments = await Promise.allSettled(msg.elements.map(
            async (element) => {
                for (const key in element) {
                    if (keyCanBeParsed(key, this.rawToOb11Converters) && element[key]) {
                        const converters = this.rawToOb11Converters[key] as (
                            element: Exclude<MessageElement[keyof RawToOb11Converters], null | undefined>,
                            msg: RawMessage,
                            elementWrapper: MessageElement,
                            context: RecvMessageContext
                        ) => PromiseLike<OB11MessageData | null>;
                        const parsedElement = await converters?.(
                            element[key],
                            msg,
                            element,
                            { parseMultMsg }
                        );
                        if (key === 'faceElement' && !parsedElement) {
                            return null;
                        }
                        return parsedElement;
                    }
                }
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

    async sendMsgWithOb11UniqueId(peer: Peer, sendElements: SendMessageElement[], deleteAfterSentFiles: string[], waitComplete = true) {
        if (!sendElements.length) {
            throw new Error('消息体无法解析, 请检查是否发送了不支持的消息类型');
        }
        let totalSize = 0;
        let timeout = 10000;
        try {
            for (const fileElement of sendElements) {
                if (fileElement.elementType === ElementType.PTT) {
                    totalSize += (await fsPromise.stat(fileElement.pttElement.filePath)).size;
                }
                if (fileElement.elementType === ElementType.FILE) {
                    totalSize += (await fsPromise.stat(fileElement.fileElement.filePath)).size;
                }
                if (fileElement.elementType === ElementType.VIDEO) {
                    totalSize += (await fsPromise.stat(fileElement.videoElement.filePath)).size;
                }
                if (fileElement.elementType === ElementType.PIC) {
                    totalSize += (await fsPromise.stat(fileElement.picElement.sourcePath)).size;
                }
            }
            //且 PredictTime ((totalSize / 1024 / 512) * 1000)不等于Nan
            const PredictTime = totalSize / 1024 / 256 * 1000;
            if (!Number.isNaN(PredictTime)) {
                timeout += PredictTime;// 10S Basic Timeout + PredictTime( For File 512kb/s )
            }
        } catch (e) {
            this.core.context.logger.logError('发送消息计算预计时间异常', e);
        }
        const returnMsg = await this.core.apis.MsgApi.sendMsg(peer, sendElements, waitComplete, timeout);
        if (!returnMsg) throw new Error('发送消息失败');
        returnMsg.id = MessageUnique.createUniqueMsgId({
            chatType: peer.chatType,
            guildId: '',
            peerUid: peer.peerUid,
        }, returnMsg.msgId);

        setTimeout(() => {
            deleteAfterSentFiles.forEach(async file => {
                try {
                    if (await fsPromise.access(file, constants.W_OK).then(() => true).catch(() => false)) {
                        fsPromise.unlink(file).then().catch(e => this.core.context.logger.logError('发送消息删除文件失败', e));
                    }
                } catch (error) {
                    this.core.context.logger.logError('发送消息删除文件失败', (error as Error).message);
                }
            });
        }, 60000);

        return returnMsg;
    }

    private async handleOb11FileLikeMessage(
        { data: inputdata }: OB11MessageFileBase,
        { deleteAfterSentFiles }: SendMessageContext,
    ) {
        const realUri = inputdata.url || inputdata.file || inputdata.path || '';
        if (realUri.length === 0) {
            this.core.context.logger.logError('文件消息缺少参数', inputdata);
            throw Error('文件消息缺少参数');
        }
        const {
            path,
            fileName,
            errMsg,
            success,
        } = (await uri2local(this.core.NapCatTempPath, realUri));

        if (!success) {
            this.core.context.logger.logError('文件下载失败', errMsg);
            throw Error('文件下载失败' + errMsg);
        }

        deleteAfterSentFiles.push(path);

        return { path, fileName: inputdata.name ?? fileName };
    }
    groupChangDecreseType2String(type: number): GroupDecreaseSubType {
        switch (type) {
            case 130:
                return 'leave';
            case 131:
                return 'kick';
            case 3:
                return 'kick_me';
            default:
                return 'kick';
        }
    }

    async parseSysMessage(msg: number[]) {
        // Todo Refactor
        const SysMessage = new NapProtoMsg(PushMsgBody).decode(Uint8Array.from(msg));
        if (SysMessage.contentHead.type == 33 && SysMessage.body?.msgContent) {
            const groupChange = new NapProtoMsg(GroupChange).decode(SysMessage.body.msgContent);
            console.log(JSON.stringify(groupChange));
            return new OB11GroupIncreaseEvent(
                this.core,
                groupChange.groupUin,
                groupChange.memberUid ? +await this.core.apis.UserApi.getUinByUidV2(groupChange.memberUid) : 0,
                groupChange.operatorUid ? +await this.core.apis.UserApi.getUinByUidV2(groupChange.operatorUid) : 0,
                groupChange.decreaseType == 131 ? 'invite' : 'approve',
            );
        } else if (SysMessage.contentHead.type == 34 && SysMessage.body?.msgContent) {
            const groupChange = new NapProtoMsg(GroupChange).decode(SysMessage.body.msgContent);
            return new OB11GroupDecreaseEvent(
                this.core,
                groupChange.groupUin,
                groupChange.memberUid ? +await this.core.apis.UserApi.getUinByUidV2(groupChange.memberUid) : 0,
                groupChange.operatorUid ? +await this.core.apis.UserApi.getUinByUidV2(groupChange.operatorUid) : 0,
                this.groupChangDecreseType2String(groupChange.decreaseType),
            );
        } else if (SysMessage.contentHead.type == 528 && SysMessage.contentHead.subType == 39 && SysMessage.body?.msgContent) {
            return await this.obContext.apis.UserApi.parseLikeEvent(SysMessage.body?.msgContent);
        }

        /*
        if (msgType === 732 && subType === 16 && subSubType === 16) {
            const greyTip = GreyTipWrapper.fromBinary(Uint8Array.from(sysMsg.bodyWrapper!.wrappedBody.slice(7)));
            if (greyTip.subTypeId === 36) {
                const emojiLikeToOthers = EmojiLikeToOthersWrapper1
                    .fromBinary(greyTip.rest)
                    .wrapper!
                    .body!;
                if (emojiLikeToOthers.attributes?.operation !== 1) { // Un-like
                    return;
                }
                const eventOrEmpty = await this.apis.GroupApi.createGroupEmojiLikeEvent(
                    greyTip.groupCode.toString(),
                    await this.core.apis.UserApi.getUinByUidV2(emojiLikeToOthers.attributes!.senderUid),
                    emojiLikeToOthers.msgSpec!.msgSeq.toString(),
                    emojiLikeToOthers.attributes!.emojiId,
                );
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                eventOrEmpty && await this.networkManager.emitEvent(eventOrEmpty);
            }
        }
        */
    }
}
