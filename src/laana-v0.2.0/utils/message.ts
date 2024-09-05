import { AtType, ChatType, ElementType, NapCatCore, Peer, SendMessageElement, SendTextElement } from '@/core';
import { NapCatLaanaAdapter } from '..';
import { OutgoingMessage, SendMessagePing } from '../types/action/message';
import { Peer as LaanaPeer, Peer_Type } from '../types/entity/message';
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
                        this.laana.utils.file.toLocalPath(cacheId)
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
                        this.laana.utils.file.toLocalPath(cacheId),
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
                        this.laana.utils.file.toLocalPath(cacheId),
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
                        this.laana.utils.file.toLocalPath(cacheId),
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
                        this.laana.utils.file.toLocalPath(cacheId),
                    )
                ],
                fileCacheIds: [cacheId],
            };
        },

        musicCard: () => { throw Error('Unimplemented'); },
    };

    async laanaPeerToRaw(peer: LaanaPeer): Promise<Peer> {
        const peerUid = await this.core.apis.UserApi.getUidByUinV2(peer.uin);
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
}
