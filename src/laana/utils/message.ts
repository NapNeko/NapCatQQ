import {
    AtType,
    ChatType,
    ElementType,
    NapCatCore,
    Peer,
    RawMessage,
    ReplyElement,
    SendMessageElement,
    SendTextElement,
} from '@/core';
import { NapCatLaanaAdapter } from '..';
import { OutgoingMessage, SendMessagePing } from '../types/action/message';
import { Bubble, Message as LaanaMessage, Peer as LaanaPeer, Peer_Type } from '../types/entity/message';
import faceConfig from '@/core/external/face_config.json';

type Laana2RawConverters = {
    [key in Exclude<OutgoingMessage['content']['oneofKind'], undefined>]:
    (
        // eslint-disable-next-line
        // @ts-ignore
        msgContent: Extract<OutgoingMessage['content'], { oneofKind: key; }>[key],
        params: SendMessagePing,
    ) => PromiseLike<{
        elements: SendMessageElement[],
        fileCacheIds: string[],
    }>
}

export class LaanaMessageUtils {
    constructor(
        public core: NapCatCore,
        public laana: NapCatLaanaAdapter,
    ) {
    }

    l2r: Laana2RawConverters = {
        bubble: async (msgContent, params) => {
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

            const elements: SendMessageElement[] = [];
            const fileCacheIds: string[] = [];

            if (msgContent.repliedMsgId) {
                const replyMsg = (
                    await this.core.apis.MsgApi.getMsgsByMsgId(
                        await this.laanaPeerToRaw(params.targetPeer!),
                        [msgContent.repliedMsgId]
                    )
                ).msgList[0];
                if (!replyMsg) {
                    throw Error('回复的消息不存在');
                }
                const { msgSeq, msgId, senderUin, senderUid } = replyMsg;
                elements.push({
                    elementType: ElementType.REPLY,
                    elementId: '',
                    replyElement: {
                        replayMsgSeq: msgSeq,
                        replayMsgId: msgId,
                        senderUin: senderUin,
                        senderUidStr: senderUid,
                    }
                });
            }

            for (const seg of msgContent.segments) {
                const content = seg.content;
                if (content.oneofKind === 'text') {
                    elements.push({
                        elementType: ElementType.TEXT,
                        elementId: '',
                        textElement: {
                            content: content.text,
                            atType: AtType.notAt,
                            atUid: '',
                            atTinyId: '',
                            atNtUid: '',
                        },
                    });
                } else if (content.oneofKind === 'at') {
                    if (params.targetPeer?.type !== Peer_Type.GROUP) {
                        throw Error('试图在私聊会话中使用 At');
                    }

                    if (content.at.uin === '0') {
                        elements.push(at(
                            '0', '0',
                            AtType.atAll,
                            '所有人',
                        ));
                    }

                    const atMember = await this.core.apis.GroupApi
                        .getGroupMember(params.targetPeer.uin, content.at.uin);
                    if (atMember) {
                        elements.push(at(
                            content.at.uin,
                            atMember.uid,
                            AtType.atUser,
                            atMember.cardName || atMember.nick,
                        ));
                    } else {
                        const uid = await this.core.apis.UserApi.getUidByUinV2(content.at.uin);
                        if (!uid) {
                            throw Error('查询用户 UID 失败');
                        }
                        const info = await this.core.apis.UserApi.getUserDetailInfo(uid);
                        elements.push(at(
                            content.at.uin,
                            uid,
                            AtType.atUser,
                            info.nick || '未知用户',
                        ));
                    }
                } else if (content.oneofKind === 'face') {
                    const parsedFaceId = content.face;
                    // 从face_config.json中获取表情名称
                    const sysFaces = faceConfig.sysface;
                    const face = sysFaces.find((systemFace) => systemFace.QSid === parsedFaceId.toString());
                    if (!face) {
                        throw Error('未知的表情 ID');
                    }

                    const faceType = parsedFaceId >= 222 ?
                        face.AniStickerType ?
                            3 : 2 : 1;
                    elements.push({
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
                    });
                } else if (content.oneofKind === 'image') {
                    const cacheId = await this.laana.utils.file.resolveCacheIdFromLaanaFile(content.image);
                    elements.push(await this.core.apis.FileApi.createValidSendPicElement(
                        await this.laana.utils.file.toLocalPath(cacheId)
                    ));
                    fileCacheIds.push(cacheId);
                } else {
                    throw Error('未知的消息内容类型');
                }
            }

            return { elements, fileCacheIds };
        },

        file: async msgContent => {
            const cacheId = await this.laana.utils.file.resolveCacheIdFromLaanaFile(msgContent.file!);
            return {
                elements: [
                    await this.core.apis.FileApi.createValidSendFileElement(
                        await this.laana.utils.file.toLocalPath(cacheId),
                        msgContent.name,
                    ),
                ],
                fileCacheIds: [cacheId],
            };
        },

        singleImage: async msgContent => {
            const cacheId = await this.laana.utils.file.resolveCacheIdFromLaanaFile(msgContent.image!);
            return {
                elements: [
                    await this.core.apis.FileApi.createValidSendPicElement(
                        await this.laana.utils.file.toLocalPath(cacheId),
                        msgContent.displayText, // TODO: make display text optional
                        // TODO: add 'sub type' field
                    )
                ],
                fileCacheIds: [cacheId],
            };
        },

        marketFace: async msgContent => ({
            elements: [{
                elementType: ElementType.MFACE,
                marketFaceElement: {
                    emojiPackageId: msgContent.facePackageId,
                    emojiId: msgContent.faceId,
                    key: msgContent.faceKey,
                    faceName: msgContent.displayText ?? '[商城表情]',
                },
            }],
            fileCacheIds: [],
        }),

        video: async msgContent => {
            const cacheId = await this.laana.utils.file.resolveCacheIdFromLaanaFile(msgContent);
            return {
                elements: [
                    await this.core.apis.FileApi.createValidSendVideoElement(
                        await this.laana.utils.file.toLocalPath(cacheId),
                        // TODO: add file name and thumb path
                    ),
                ],
                fileCacheIds: [cacheId],
            };
        },

        voice: async msgContent => {
            const cacheId = await this.laana.utils.file.resolveCacheIdFromLaanaFile(msgContent);
            return {
                elements: [
                    await this.core.apis.FileApi.createValidSendPttElement(
                        await this.laana.utils.file.toLocalPath(cacheId),
                    )
                ],
                fileCacheIds: [cacheId],
            };
        },

        musicCard: () => { throw Error('Unimplemented'); },
    };

    async laanaPeerToRaw(peer: LaanaPeer): Promise<Peer> {
        const peerUid = peer.type === Peer_Type.BUDDY ?
            await this.core.apis.UserApi.getUidByUinV2(peer.uin) :
            peer.uin;
        if (!peerUid) {
            throw Error('查询用户 UID 失败');
        }
        return {
            chatType: peer.type === Peer_Type.GROUP ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C,
            guildId: '',
            peerUid,
        };
    }

    async laanaMessageToRaw(msg: OutgoingMessage, params: SendMessagePing) {
        if (!msg.content.oneofKind) {
            throw Error('消息内容类型未知');
        }
        return this.l2r[msg.content.oneofKind](
            // eslint-disable-next-line
            // @ts-ignore
            msg.content[msg.content.oneofKind],
            params
        );
    }

    async rawMessageToLaana(msg: RawMessage): Promise<LaanaMessage | null> {
        const msgContentOrNull = await this.createLaanaMessageContent(msg);
        if (!msgContentOrNull) {
            return null;
        }
        return {
            msgId: msg.msgId,
            time: BigInt(msg.msgTime),
            senderUin: msg.senderUin,
            peer: {
                uin: msg.peerUin,
                type: msg.chatType === ChatType.KCHATTYPEGROUP ?
                    Peer_Type.GROUP : Peer_Type.BUDDY,
            },
            content: msgContentOrNull,
        };
    }

    private async createLaanaMessageContent(msg: RawMessage): Promise<LaanaMessage['content'] | null> {
        const firstElement = msg.elements[0];

        if (!firstElement) {
            throw Error('消息内容为空');
        }

        if (
            // 图文混排消息
            firstElement.textElement ||
            firstElement.faceElement ||
            firstElement.replyElement ||
            (firstElement.picElement && msg.elements.length > 1)
        ) {
            let repliedMsgId: string | undefined;
            let startingIndex = 0;

            if (firstElement.replyElement) {
                repliedMsgId = await this.getRepliedMsgId(firstElement.replyElement, msg);
                startingIndex = 1;
            }
            const bubble: Bubble = { segments: [], repliedMsgId };
            for (let i = startingIndex; i < msg.elements.length; i++) {
                const element = msg.elements[i];
                if (element.textElement) {
                    const textElement = element.textElement;
                    if (textElement.atType === AtType.notAt) {
                        bubble.segments.push({
                            content: {
                                oneofKind: 'text',
                                text: textElement.content.replace(/\r/g, '\n'),
                            },
                        });
                    } else if (textElement.atType === AtType.atUser) {
                        bubble.segments.push({
                            content: {
                                oneofKind: 'at',
                                at: {
                                    groupCode: msg.peerUin,
                                    uin: textElement.atUid,
                                    name: textElement.content.slice(1),
                                }
                            },
                        });
                    } else { // atAll
                        bubble.segments.push({
                            content: {
                                oneofKind: 'at',
                                at: {
                                    groupCode: msg.peerUin,
                                    uin: '0',
                                    name: '全体成员',
                                }
                            },
                        });
                    }
                } else if (element.faceElement) {
                    bubble.segments.push({
                        content: {
                            oneofKind: 'face',
                            face: element.faceElement.faceIndex,
                        },
                    });
                } else if (element.picElement) {
                    bubble.segments.push({
                        content: {
                            oneofKind: 'image',
                            image: {
                                uri: {
                                    oneofKind: 'url',
                                    url: await this.core.apis.FileApi.getImageUrl(element.picElement),
                                }
                            }
                        },
                    });
                } else {
                    this.core.context.logger.logWarn('未知的消息元素类型', element.elementType);
                }
            }
            return { oneofKind: 'bubble', bubble };
        } else {
            if (msg.elements.length > 1) {
                this.core.context.logger.logWarn('意外的消息链长度', msg.elements.length, '将只解析第一个元素');
            }

            if (firstElement.fileElement) {
                return {
                    oneofKind: 'file',
                    file: {
                        file: {
                            uri: {
                                oneofKind: 'cacheId',
                                cacheId: this.laana.utils.file
                                    .encodeFileElementToCacheId(
                                        msg.msgId,
                                        msg.chatType,
                                        msg.peerUid,
                                        firstElement.elementId
                                    ),
                            }
                        },
                        name: firstElement.fileElement.fileName,
                        size: BigInt(firstElement.fileElement.fileSize),
                    },
                };
            } else if (firstElement.picElement) {
                return {
                    oneofKind: 'singleImage',
                    singleImage: {
                        image: {
                            uri: {
                                oneofKind: 'url',
                                url: await this.core.apis.FileApi.getImageUrl(firstElement.picElement),
                            }
                        },
                        displayText: firstElement.picElement.summary || '[图片]',
                    }
                };
            } else if (firstElement.marketFaceElement) {
                return {
                    oneofKind: 'marketFace',
                    marketFace: {
                        faceId: firstElement.marketFaceElement.emojiId,
                        faceKey: firstElement.marketFaceElement.key,
                        facePackageId: firstElement.marketFaceElement.emojiPackageId,
                        displayText: firstElement.marketFaceElement.faceName,
                    }
                };
            } else if (firstElement.videoElement) {
                let cacheId = '';
                const urls = await this.core.apis.FileApi.getVideoUrl(
                    {
                        chatType: msg.chatType,
                        guildId: msg.guildId,
                        peerUid: msg.peerUid,
                    },
                    msg.msgId,
                    firstElement.elementId
                );
                const urlOrEmpty = urls.find(urlWrapper => urlWrapper.url !== '')?.url;
                if (!urlOrEmpty) {
                    this.core.context.logger.logWarn('视频链接获取失败', msg.msgId);
                    cacheId = this.laana.utils.file.encodeFileElementToCacheId(
                        msg.msgId,
                        msg.chatType,
                        msg.peerUid,
                        firstElement.elementId
                    );
                }

                return {
                    oneofKind: 'video',
                    video: {
                        video: {
                            uri: urlOrEmpty ? {
                                oneofKind: 'url',
                                url: urlOrEmpty,
                            } : {
                                oneofKind: 'cacheId',
                                cacheId,
                            }
                        },
                    }
                };
            } else if (firstElement.pttElement) {
                return {
                    oneofKind: 'voice',
                    voice: {
                        voice: {
                            uri: {
                                oneofKind: 'cacheId',
                                cacheId: this.laana.utils.file.encodeFileElementToCacheId(
                                    msg.msgId,
                                    msg.chatType,
                                    msg.peerUid,
                                    firstElement.elementId
                                ),
                            }
                        },
                        duration: 5 // TODO: implement duration field, or... delete it?
                    }
                };
            } else if (firstElement.multiForwardMsgElement) {
                return {
                    oneofKind: 'forwardMsgRef',
                    forwardMsgRef: {
                        refId: msg.msgId,
                        // TODO: remove this field, since it is redundant to query forwarded msg with another refId
                        displayText: firstElement.multiForwardMsgElement.xmlContent,
                    }
                };
            } else {
                this.core.context.logger.logWarn('未知的消息元素类型', firstElement.elementType);
                return null; // TODO: add 'extended' message content type
            }
        }
    }

    async getRepliedMsgId(element: ReplyElement, msg: RawMessage) {
        const record = msg.records.find(
            msgRecord => msgRecord.msgId === element.sourceMsgIdInRecords
        );

        if (!(record && element.replyMsgTime && element.senderUidStr)) {
            this.core.context.logger.logWarn('获取不到引用的消息', element.replayMsgId);
            return undefined;
        }

        if (record.peerUin === '284840486') {
            return record.msgId;
        }

        const repliedMsgOrEmpty = (await this.core.apis.MsgApi
            .queryMsgsWithFilterExWithSeqV2(
                {
                    chatType: msg.chatType,
                    guildId: msg.guildId,
                    peerUid: record.peerUid,
                },
                element.replayMsgSeq,
                element.replyMsgTime,
                [element.senderUidStr]
            )
        ).msgList.find(msg => msg.msgRandom === record.msgRandom);

        if (!repliedMsgOrEmpty) {
            this.core.context.logger.logWarn('获取不到引用的消息', element.replayMsgId);
            return undefined;
        }

        return repliedMsgOrEmpty.msgId;
    }
}
