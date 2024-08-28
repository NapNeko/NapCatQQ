import { UUIDConverter } from '@/common/helper';
import { MessageUnique } from '@/common/message-unique';
import {
    AtType,
    ChatType,
    CustomMusicSignPostData,
    ElementType,
    FaceIndex,
    FaceType,
    IdMusicSignPostData,
    MessageElement,
    NapCatCore, NTGrayTipElementSubTypeV2,
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
} from '@/onebot';
import { OB11Entities } from '../helper';
import { EventType } from '@/onebot/event/OB11BaseEvent';
import { encodeCQCode } from '@/onebot/helper/cqcode';
import { uri2local } from '@/common/file';
import { RequestUtil } from '@/common/request';
import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import { OB11FriendAddNoticeEvent } from '@/onebot/event/notice/OB11FriendAddNoticeEvent';

type RawToOb11Converters = {
    [Key in keyof MessageElement as Key extends `${string}Element` ? Key : never]: (
        element: Exclude<MessageElement[Key], null | undefined>,
        msg: RawMessage,
        elementWrapper: MessageElement,
    ) => PromiseLike<OB11MessageData | null>
}

type Ob11ToRawConverters = {
    [Key in OB11MessageDataType]: (
        sendMsg: Extract<OB11MessageData, { type: Key }>,
        context: MessageContext,
    ) => Promise<SendMessageElement | undefined>
}

export type MessageContext = {
    deleteAfterSentFiles: string[],
    peer: Peer
}

function keyCanBeParsed(key: string, parser: RawToOb11Converters): key is keyof RawToOb11Converters {
    return key in parser;
}

export class OneBotMsgApi {
    obContext: NapCatOneBot11Adapter;
    core: NapCatCore;

    rawToOb11Converters: RawToOb11Converters = {
        textElement: async element => {
            if (element.atType === AtType.notAt) {
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
                if (element.atType !== AtType.atAll) {
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

        picElement: async (element, msg) => {
            try {
                return {
                    type: OB11MessageDataType.image,
                    data: {
                        file: element.fileName,
                        sub_type: element.picSubType,
                        file_id: UUIDConverter.encode(msg.peerUin, msg.msgId),
                        url: await this.core.apis.FileApi.getImageUrl(element),
                        file_size: element.fileSize,
                    },
                };
            } catch (e: any) {
                this.core.context.logger.logError('获取图片url失败', e.stack);
                return null;
            }
        },

        fileElement: async (element, msg, elementWrapper) => {
            await this.core.apis.FileApi.addFileCache(
                {
                    peerUid: msg.peerUid,
                    chatType: msg.chatType,
                    guildId: '',
                },
                msg.msgId,
                msg.msgSeq,
                msg.senderUid,
                elementWrapper.elementId,
                elementWrapper.elementType.toString(),
                element.fileSize,
                element.fileName,
            );
            return {
                type: OB11MessageDataType.file,
                data: {
                    file: element.fileName,
                    path: element.filePath,
                    url: element.filePath,
                    file_id: UUIDConverter.encode(msg.peerUin, msg.msgId),
                    file_size: element.fileSize,
                },
            };
        },

        faceElement: async element => {
            const faceIndex = element.faceIndex;
            if (faceIndex === FaceIndex.dice) {
                return {
                    type: OB11MessageDataType.dice,
                    data: {
                        result: element.resultId!,
                    },
                };
            } else if (faceIndex === FaceIndex.RPS) {
                return {
                    type: OB11MessageDataType.RPS,
                    data: {
                        result: element.resultId!,
                    },
                };
            } else {
                return {
                    type: OB11MessageDataType.face,
                    data: {
                        id: element.faceIndex.toString(),
                    },
                };
            }
        },

        marketFaceElement: async (_, msg, elementWrapper) => {
            await this.core.apis.FileApi.addFileCache(
                {
                    peerUid: msg.peerUid,
                    chatType: msg.chatType,
                    guildId: '',
                },
                msg.msgId,
                msg.msgSeq,
                msg.senderUid,
                elementWrapper.elementId,
                elementWrapper.elementType.toString(),
                '0',
                'marketface',
            );
            return {
                type: OB11MessageDataType.image,
                data: {
                    file: 'marketface',
                    file_id: UUIDConverter.encode(msg.peerUin, msg.msgId),
                    path: elementWrapper.elementId,
                    url: elementWrapper.elementId,
                },
            };
        },

        replyElement: async (element, msg) => {
            const NTQQMsgApi = this.core.apis.MsgApi;
            const records = msg.records.find(msgRecord => msgRecord.msgId === element?.sourceMsgIdInRecords);
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };
            if (!records) {
                this.core.context.logger.logError('获取不到引用的消息', element.replayMsgSeq);
                return null;
            }
            let replyMsg: RawMessage | undefined;
            // Attempt 1
            replyMsg = (await NTQQMsgApi.getMsgsBySeqAndCount({
                peerUid: msg.peerUid,
                guildId: '',
                chatType: msg.chatType,
            }, element.replayMsgSeq, 1, true, true))
                .msgList
                .find(msg => msg.msgRandom === records.msgRandom);

            if (!replyMsg || records.msgRandom !== replyMsg.msgRandom) {
                // Attempt 2
                replyMsg = (await NTQQMsgApi.getSingleMsg(peer, element.replayMsgSeq)).msgList[0];

                if ((!replyMsg || records.msgRandom !== replyMsg.msgRandom) && msg.peerUin !== '284840486') {
                    // Attempt 3
                    const replyMsgList = (await NTQQMsgApi.getMsgExBySeq(peer, records.msgSeq)).msgList;
                    if (replyMsgList.length < 1) {
                        this.core.context.logger.logError('回复消息消息验证失败', element.replayMsgSeq);
                        return null;
                    }
                    replyMsg = replyMsgList.filter(e => e.msgSeq == records.msgSeq)
                        .sort((a, b) => parseInt(a.msgTime) - parseInt(b.msgTime))[0];
                }
            }

            return {
                type: OB11MessageDataType.reply,
                data: {
                    id: MessageUnique.createMsg({
                        peerUid: msg.peerUid,
                        guildId: '',
                        chatType: msg.chatType,
                    }, replyMsg.msgId).toString(),
                },
            };
        },

        videoElement: async (element, msg, elementWrapper) => {
            const NTQQFileApi = this.core.apis.FileApi;

            //读取视频链接并兜底
            let videoUrlWrappers: Awaited<ReturnType<typeof NTQQFileApi.getVideoUrl>> | undefined;

            if (msg.peerUin === '284840486') {
                //TODO: 合并消息内部 应该进行特殊处理 可能需要重写peer 待测试与研究 Mlikiowa Tagged
            }
            try {
                videoUrlWrappers = await NTQQFileApi.getVideoUrl({
                    chatType: msg.chatType,
                    peerUid: msg.peerUid,
                    guildId: '0',
                }, msg.msgId, elementWrapper.elementId);
            } catch (error) {
                this.core.context.logger.logWarn('获取视频 URL 失败');
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

            await NTQQFileApi.addFileCache(
                {
                    peerUid: msg.peerUid,
                    chatType: msg.chatType,
                    guildId: '',
                },
                msg.msgId,
                msg.msgSeq,
                msg.senderUid,
                elementWrapper.elementId,
                elementWrapper.elementType.toString(),
                element.fileSize ?? '0',
                element.fileName,
            );

            return {
                type: OB11MessageDataType.video,
                data: {
                    file: element.fileName,
                    path: videoDownUrl,
                    url: videoDownUrl,
                    file_id: UUIDConverter.encode(msg.peerUin, msg.msgId),
                    file_size: element.fileSize,
                },
            };
        },

        pttElement: async (element, msg, elementWrapper) => {
            await this.core.apis.FileApi.addFileCache(
                {
                    peerUid: msg.peerUid,
                    chatType: msg.chatType,
                    guildId: '',
                },
                msg.msgId,
                msg.msgSeq,
                msg.senderUid,
                elementWrapper.elementId,
                elementWrapper.elementType.toString(),
                element.fileSize || '0',
                element.fileUuid || '',
            );
            return {
                type: OB11MessageDataType.voice,
                data: {
                    file: element.fileName,
                    path: element.filePath,
                    file_id: UUIDConverter.encode(msg.peerUin, msg.msgId),
                    file_size: element.fileSize,
                },
            };
        },

        multiForwardMsgElement: async (_, msg) => {
            const NTQQMsgApi = this.core.apis.MsgApi;
            const message_data: OB11MessageForward = {
                data: {} as any,
                type: OB11MessageDataType.forward,
            };
            message_data.data.id = msg.msgId;
            const parentMsgPeer = msg.parentMsgPeer ?? {
                chatType: msg.chatType,
                guildId: '',
                peerUid: msg.peerUid,
            };
            //判断是否在合并消息内
            msg.parentMsgIdList = msg.parentMsgIdList ?? [];
            //首次列表不存在则开始创建
            msg.parentMsgIdList.push(msg.msgId);
            //let parentMsgId = msg.parentMsgIdList[msg.parentMsgIdList.length - 2 < 0 ? 0 : msg.parentMsgIdList.length - 2];
            //加入自身MsgId
            const multiMsgs = (await NTQQMsgApi.getMultiMsg(parentMsgPeer, msg.parentMsgIdList[0], msg.msgId))?.msgList;
            //拉取下级消息
            if (!multiMsgs) return null;
            //拉取失败则跳过

            return {
                type: OB11MessageDataType.forward,
                data: {
                    id: msg.msgId,
                    content: (await Promise.all(multiMsgs.map(
                        async multiMsgItem => {
                            multiMsgItem.parentMsgPeer = parentMsgPeer;
                            multiMsgItem.parentMsgIdList = msg.parentMsgIdList;
                            multiMsgItem.id = MessageUnique.createMsg(parentMsgPeer, multiMsgItem.msgId); //该ID仅用查看 无法调用
                            return await this.parseMessage(multiMsgItem);
                        },
                    ))).filter(item => item !== undefined),
                },
            };
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
                atType: AtType.notAt,
                atUid: '',
                atTinyId: '',
                atNtUid: '',
            },
        }),

        [OB11MessageDataType.at]: async ({ data: { qq: atQQ } }, context) => {
            function at(atUid: string, atNtUid: string, atType: AtType, atName: string): SendTextElement {
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
            if (atQQ === 'all') return at(atQQ, atQQ, AtType.atAll, '全体成员');
            const NTQQGroupApi = this.core.apis.GroupApi;
            const NTQQUserApi = this.core.apis.UserApi;
            const atMember = await NTQQGroupApi.getGroupMember(context.peer.peerUid, atQQ);
            if (atMember) {
                return at(atQQ, atMember.uid, AtType.atUser, atMember.nick || atMember.cardName);
            }
            const uid = await NTQQUserApi.getUidByUinV2(`${atQQ}`);
            if (!uid) throw new Error('Get Uid Error');
            const info = await NTQQUserApi.getUserDetailInfo(uid);
            return at(atQQ, uid, AtType.atUser, info.nick || '');
        },

        [OB11MessageDataType.reply]: async ({ data: { id } }) => {
            const replyMsgM = MessageUnique.getMsgIdAndPeerByShortId(parseInt(id));
            if (!replyMsgM) {
                this.core.context.logger.logWarn('回复消息不存在', id);
                return undefined;
            }
            const NTQQMsgApi = this.core.apis.MsgApi;
            const replyMsg = (await NTQQMsgApi.getMsgsByMsgId(
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
            let parsedFaceId = parseInt(id);
            // 从face_config.json中获取表情名称
            const sysFaces = faceConfig.sysface;
            const face: any = sysFaces.find((systemFace) => systemFace.QSid === parsedFaceId.toString());
            parsedFaceId = parseInt(parsedFaceId.toString());
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
            marketFaceElement: {
                emojiPackageId: emoji_package_id,
                emojiId: emoji_id,
                key,
                faceName: summary || '[商城表情]',
            },
        }),

        // File service
        [OB11MessageDataType.image]: async (sendMsg, context) => {
            const sendPicElement = await this.core.apis.FileApi.createValidSendPicElement(
                (await this.handleOb11FileLikeMessage(sendMsg, context)).path,
                sendMsg.data.summary,
                sendMsg.data.sub_type,
            );
            context.deleteAfterSentFiles.push(sendPicElement.picElement.sourcePath);
            return sendPicElement;
        },

        [OB11MessageDataType.file]: async (sendMsg, context) => {
            const { path, fileName } = await this.handleOb11FileLikeMessage(sendMsg, context);
            return await this.core.apis.FileApi.createValidSendFileElement(path, fileName);
        },

        [OB11MessageDataType.video]: async (sendMsg, context) => {
            const { path, fileName } = await this.handleOb11FileLikeMessage(sendMsg, context);

            let thumb = sendMsg.data.thumb;
            if (thumb) {
                const uri2LocalRes = await uri2local(this.core.NapCatTempPath, thumb);
                if (uri2LocalRes.success) thumb = uri2LocalRes.path;
            }
            const videoEle = await this.core.apis.FileApi.createValidSendVideoElement(path, fileName, thumb);

            context.deleteAfterSentFiles.push(videoEle.videoElement.filePath);
            return videoEle;
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
        }),

        [OB11MessageDataType.RPS]: async () => ({
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
        }),

        // Need signing
        [OB11MessageDataType.markdown]: async ({ data: { content } }) => ({
            elementType: ElementType.MARKDOWN,
            elementId: '',
            markdownElement: { content },
        }),

        [OB11MessageDataType.music]: async ({ data }, context) => {
            // 保留, 直到...找到更好的解决方案
            if (data.type === 'custom') {
                if (!data.url) {
                    this.core.context.logger.logError('自定义音卡缺少参数url');
                    return undefined;
                }
                if (!data.audio) {
                    this.core.context.logger.logError('自定义音卡缺少参数audio');
                    return undefined;
                }
                if (!data.title) {
                    this.core.context.logger.logError('自定义音卡缺少参数title');
                    return undefined;
                }
            } else {
                if (!['qq', '163'].includes(data.type)) {
                    this.core.context.logger.logError('音乐卡片type错误, 只支持qq、163、custom，当前type:', data.type);
                    return undefined;
                }
                if (!data.id) {
                    this.core.context.logger.logError('音乐卡片缺少参数id');
                    return undefined;
                }
            }

            let postData: IdMusicSignPostData | CustomMusicSignPostData;
            if (data.type === 'custom' && data.content) {
                const { content, ...others } = data;
                postData = { singer: content, ...others };
            } else {
                postData = data;
            }
            const signUrl = this.obContext.configLoader.configData.musicSignUrl;
            if (!signUrl) {
                throw Error('音乐消息签名地址未配置');
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

        [OB11MessageDataType.forward]: async () => undefined,

        [OB11MessageDataType.xml]: async () => undefined,

        [OB11MessageDataType.poke]: async () => undefined,

        [OB11MessageDataType.Location]: async () => ({
            elementType: ElementType.SHARELOCATION,
            elementId: '',
            shareLocationElement: {
                text: '测试',
                ext: '',
            },
        }),

        [OB11MessageDataType.miniapp]: async () => undefined,
    };

    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }

    async parsePrivateMsgEvent(msg: RawMessage) {
        if (msg.chatType !== ChatType.KCHATTYPEC2C) {
            return;
        }
        for (const element of msg.elements) {
            if (element.grayTipElement) {
                if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_JSON) {
                    if (element.grayTipElement.jsonGrayTipElement.busiId == 1061) {
                        const PokeEvent = await this.obContext.apis.FriendApi.parsePrivatePokeEvent(element.grayTipElement);
                        if (PokeEvent) return PokeEvent;
                    }
                }
                if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_XMLMSG) {
                    //好友添加成功事件
                    if (element.grayTipElement.xmlElement.templId === '10229' && msg.peerUin !== '') {
                        return new OB11FriendAddNoticeEvent(this.core, parseInt(msg.peerUin));
                    }
                }
            }
        }
    }

    async parseMessage(
        msg: RawMessage,
        messagePostFormat: string = this.obContext.configLoader.configData.messagePostFormat,
    ) {
        if (msg.senderUin == '0' || msg.senderUin == '') return;
        if (msg.peerUin == '0' || msg.peerUin == '') return;
        //跳过空消息
        const NTQQGroupApi = this.core.apis.GroupApi;
        const NTQQUserApi = this.core.apis.UserApi;
        const NTQQMsgApi = this.core.apis.MsgApi;
        const resMsg: OB11Message = {
            self_id: parseInt(this.core.selfInfo.uin),
            user_id: parseInt(msg.senderUin!),
            time: parseInt(msg.msgTime) || Date.now(),
            message_id: msg.id!,
            message_seq: msg.id!,
            real_id: msg.id!,
            message_type: msg.chatType == ChatType.KCHATTYPEGROUP ? 'group' : 'private',
            sender: {
                user_id: parseInt(msg.senderUin || '0'),
                nickname: msg.sendNickName,
                card: msg.sendMemberName || '',
            },
            raw_message: '',
            font: 14,
            sub_type: 'friend',
            message: messagePostFormat === 'string' ? '' : [],
            message_format: messagePostFormat === 'string' ? 'string' : 'array',
            post_type: this.core.selfInfo.uin == msg.senderUin ? EventType.MESSAGE_SENT : EventType.MESSAGE,
        };
        if (msg.chatType == ChatType.KCHATTYPEGROUP) {
            resMsg.sub_type = 'normal'; // 这里go-cqhttp是group，而onebot11标准是normal, 蛋疼
            resMsg.group_id = parseInt(msg.peerUin);
            let member = await NTQQGroupApi.getGroupMember(msg.peerUin, msg.senderUin);
            if (!member) member = await NTQQGroupApi.getGroupMember(msg.peerUin, msg.senderUin);
            if (member) {
                resMsg.sender.role = OB11Entities.groupMemberRole(member.role);
                resMsg.sender.nickname = member.nick;
            }
        } else if (msg.chatType == ChatType.KCHATTYPEC2C) {
            resMsg.sub_type = 'friend';
            resMsg.sender.nickname = (await NTQQUserApi.getUserDetailInfo(msg.senderUid)).nick;
        } else if (msg.chatType == ChatType.KCHATTYPETEMPC2CFROMGROUP) {
            resMsg.sub_type = 'group';
            const ret = await NTQQMsgApi.getTempChatInfo(ChatType.KCHATTYPETEMPC2CFROMGROUP, msg.senderUid);
            if (ret.result === 0) {
                resMsg.group_id = parseInt(ret.tmpChatInfo!.groupCode);
                resMsg.sender.nickname = ret.tmpChatInfo!.fromNick;
            } else {
                resMsg.group_id = 284840486; //兜底数据
                resMsg.sender.nickname = '临时会话';
            }
        }

        const msgSegments = (await Promise.allSettled(msg.elements.map(
            async (element) => {
                for (const key in element) {
                    if (keyCanBeParsed(key, this.rawToOb11Converters) && element[key]) {
                        return await this.rawToOb11Converters[key]?.(
                            // eslint-disable-next-line
                            // @ts-ignore
                            element[key],
                            msg,
                            element,
                        );
                    }
                }
            },
        ))).filter(entry => {
            if (entry.status === 'fulfilled') {
                return !!entry.value;
            } else {
                this.core.context.logger.logError('消息段解析失败', entry.reason);
                return false;
            }
        }).map((entry) => (<PromiseFulfilledResult<OB11MessageData>>entry).value);

        const msgAsCQCode = msgSegments.map(msg => encodeCQCode(msg)).join('').trim();

        if (messagePostFormat === 'string') {
            resMsg.message = msgAsCQCode;
            resMsg.raw_message = msgAsCQCode;
        } else {
            resMsg.message = msgSegments;
            resMsg.raw_message = msgAsCQCode;
        }
        return resMsg;
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
            const callResult = this.ob11ToRawConverters[sendMsg.type](
                // eslint-disable-next-line
                // @ts-ignore
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
                    totalSize += fs.statSync(fileElement.pttElement.filePath).size;
                }
                if (fileElement.elementType === ElementType.FILE) {
                    totalSize += fs.statSync(fileElement.fileElement.filePath).size;
                }
                if (fileElement.elementType === ElementType.VIDEO) {
                    totalSize += fs.statSync(fileElement.videoElement.filePath).size;
                }
                if (fileElement.elementType === ElementType.PIC) {
                    totalSize += fs.statSync(fileElement.picElement.sourcePath).size;
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
        returnMsg.id = MessageUnique.createMsg({
            chatType: peer.chatType,
            guildId: '',
            peerUid: peer.peerUid,
        }, returnMsg.msgId);
        deleteAfterSentFiles.forEach(file => {
            fsPromise.unlink(file).then().catch(e => this.core.context.logger.logError('发送消息删除文件失败', e));
        });
        return returnMsg;
    }

    private async handleOb11FileLikeMessage(
        { data: inputdata }: OB11MessageFileBase,
        { deleteAfterSentFiles }: MessageContext,
    ) {
        const isBlankUrl = !inputdata.url || inputdata.url === '';
        const isBlankFile = !inputdata.file || inputdata.file === '';
        if (isBlankUrl && isBlankFile) {
            this.core.context.logger.logError('文件消息缺少参数', inputdata);
            throw Error('文件消息缺少参数');
        }
        const fileOrUrl = (isBlankUrl ? inputdata.file : inputdata.url) ?? '';
        const {
            path,
            isLocal,
            fileName,
            errMsg,
            success,
        } = (await uri2local(this.core.NapCatTempPath, fileOrUrl));

        if (!success) {
            this.core.context.logger.logError('文件下载失败', errMsg);
            throw Error('文件下载失败' + errMsg);
        }

        if (!isLocal) { // 只删除http和base64转过来的文件
            deleteAfterSentFiles.push(path);
        }

        return { path, fileName: inputdata.name ?? fileName };
    }
}
