import { UUIDConverter } from '@/common/utils/helper';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { AtType, ChatType, FaceIndex, MessageElement, NapCatCore, RawMessage } from '@/core';
import { NapCatOneBot11Adapter, OB11Message, OB11MessageData, OB11MessageDataType } from '@/onebot';
import { OB11Constructor } from '../helper';
import { EventType } from '@/onebot/event/OB11BaseEvent';
import { encodeCQCode } from '@/onebot/helper/cqcode';

type RawToOb11Converters = {
    [Key in keyof MessageElement as Key extends `${string}Element` ? Key : never]: (
        element: Exclude<MessageElement[Key], null | undefined>,
        msg: RawMessage,
        elementWrapper: MessageElement
    ) => PromiseLike<OB11MessageData | null>
}

function keyCanBeParsed(key: string, parser: RawToOb11Converters): key is keyof RawToOb11Converters {
    return key in parser;
}

export class OneBotMsgApi {
    obContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;

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
                    data: { text }
                };
            } else {
                let qq: string = 'all';
                if (element.atType !== AtType.atAll) {
                    const { atNtUid, /* content */ } = element;
                    let atQQ = element.atUid;
                    if (!atQQ || atQQ === '0') {
                        atQQ = await this.coreContext.apis.UserApi.getUinByUidV2(atNtUid);
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
                        url: await this.coreContext.apis.FileApi.getImageUrl(element),
                        file_size: element.fileSize,
                    },
                };
            } catch (e: any) {
                this.coreContext.context.logger.logError('获取图片url失败', e.stack);
                return null;
            }
        },

        fileElement: async (element, msg, elementWrapper) => {
            await this.coreContext.apis.FileApi.addFileCache(
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
                }
            };
        },

        faceElement: async element => {
            const faceIndex = element.faceIndex;
            if (faceIndex === FaceIndex.dice) {
                return {
                    type: OB11MessageDataType.dice,
                    data: {
                        result: element.resultId!,
                    }
                };
            } else if (faceIndex === FaceIndex.RPS) {
                return {
                    type: OB11MessageDataType.RPS,
                    data: {
                        result: element.resultId!,
                    }
                };
            } else {
                return {
                    type: OB11MessageDataType.face,
                    data: {
                        id: element.faceIndex.toString()
                    }
                };
            }
        },

        marketFaceElement: async (_, msg, elementWrapper) => {
            await this.coreContext.apis.FileApi.addFileCache(
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
                }
            };
        },

        replyElement: async (element, msg) => {
            const NTQQMsgApi = this.coreContext.apis.MsgApi;
            const records = msg.records.find(msgRecord => msgRecord.msgId === element?.sourceMsgIdInRecords);
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };
            if (!records) {
                this.coreContext.context.logger.logError('获取不到引用的消息', element.replayMsgSeq);
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
                        this.coreContext.context.logger.logError('回复消息消息验证失败', element.replayMsgSeq);
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
                    }, replyMsg.msgId).toString()
                }
            };
        },

        videoElement: async (element, msg, elementWrapper) => {
            const NTQQFileApi = this.coreContext.apis.FileApi;

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
                this.coreContext.context.logger.logWarn('获取视频 URL 失败');
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
                }
            };
        },
        
        pttElement: async (element, msg, elementWrapper) => {
            await this.coreContext.apis.FileApi.addFileCache(
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
                }
            };
        },

        multiForwardMsgElement: async (_, msg) => {
            const NTQQMsgApi = this.coreContext.apis.MsgApi;
            const message_data: OB11MessageData = {
                data: {} as any,
                type: 'unknown' as any,
            };
            message_data['type'] = OB11MessageDataType.forward;
            message_data['data']['id'] = msg.msgId;
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
                        }
                    ))).filter(item => item !== undefined),
                }
            };
        },

        arkElement: async (element) => {
            return {
                type: OB11MessageDataType.json,
                data: {
                    data: element.bytesData
                }
            };
        },

        markdownElement: async (element) => {
            return {
                type: OB11MessageDataType.markdown,
                data: {
                    content: element.content
                }
            };
        }
    };

    constructor(obContext: NapCatOneBot11Adapter, coreContext: NapCatCore) {
        this.obContext = obContext;
        this.coreContext = coreContext;
    }

    async parseMessage(
        msg: RawMessage,
        messagePostFormat: string = this.obContext.configLoader.configData.messagePostFormat,
    ) {
        if (msg.senderUin == '0' || msg.senderUin == '') return;
        if (msg.peerUin == '0' || msg.peerUin == '') return;
        //跳过空消息
        const NTQQGroupApi = this.coreContext.apis.GroupApi;
        const NTQQUserApi = this.coreContext.apis.UserApi;
        const NTQQMsgApi = this.coreContext.apis.MsgApi;
        const resMsg: OB11Message = {
            self_id: parseInt(this.coreContext.selfInfo.uin),
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
            post_type: this.coreContext.selfInfo.uin == msg.senderUin ? EventType.MESSAGE_SENT : EventType.MESSAGE,
        };
        if (msg.chatType == ChatType.KCHATTYPEGROUP) {
            resMsg.sub_type = 'normal'; // 这里go-cqhttp是group，而onebot11标准是normal, 蛋疼
            resMsg.group_id = parseInt(msg.peerUin);
            let member = await NTQQGroupApi.getGroupMember(msg.peerUin, msg.senderUin);
            if (!member) member = await NTQQGroupApi.getGroupMember(msg.peerUin, msg.senderUin);
            if (member) {
                resMsg.sender.role = OB11Constructor.groupMemberRole(member.role);
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

        const msgSegments = (await Promise.all(msg.elements.map(
            async (element) => {
                for (const key in element) {
                    if (keyCanBeParsed(key, this.rawToOb11Converters)) {
                        return await this.rawToOb11Converters[key]?.(
                            // eslint-disable-next-line
                            // @ts-ignore
                            element[key],
                            msg,
                            element
                        );
                    }
                }
            }
        ))).filter(entry => !!entry);

        const msgAsCQCode = msgSegments.map(msg => encodeCQCode(msg)).join('').trim();

        if (messagePostFormat === 'string') {
            resMsg.message = msgAsCQCode;
        } else {
            resMsg.message = msgSegments;
            resMsg.raw_message = msgAsCQCode;
        }
        return resMsg;
    }
}
