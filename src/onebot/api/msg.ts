import { UUIDConverter } from '@/common/utils/helper';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { AtType, ChatType, FaceIndex, MessageElement, NapCatCore, RawMessage } from '@/core';
import { NapCatOneBot11Adapter, OB11Message, OB11MessageData, OB11MessageDataType } from '@/onebot';
import { OB11Constructor } from '../helper';
import { EventType } from '@/onebot/event/OB11BaseEvent';
import { encodeCQCode } from '@/onebot/helper/cqcode';

export class OneBotMsgApi {
    obContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;

    constructor(obContext: NapCatOneBot11Adapter, coreContext: NapCatCore) {
        this.obContext = obContext;
        this.coreContext = coreContext;
    }

    async parseMessage(
        msg: RawMessage,
        messagePostFormat: string = this.obContext.configLoader.configData.messagePostFormat
    ) {
        if (msg.senderUin == "0" || msg.senderUin == "") return;
        if (msg.peerUin == "0" || msg.peerUin == "") return;
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
                resMsg.sender.nickname = "临时会话";
            }
        }
        for (const element of msg.elements) {
            let message_data: OB11MessageData = {
                data: {} as any,
                type: 'unknown' as any,
            };
            if (element.textElement && element.textElement?.atType !== AtType.notAt) {
                const textAtMsgData = await this.obContext.apiContext.MsgApi.parseTextElemntWithAt(msg, element);
                if (textAtMsgData) message_data = textAtMsgData;
            } else if (element.textElement) {
                const textMsgData = await this.obContext.apiContext.MsgApi.parseTextElement(msg, element);
                if (textMsgData) message_data = textMsgData;
            } else if (element.replyElement) {
                const replyMsgData = await this.obContext.apiContext.MsgApi.parseReplyElement(msg, element);
                if (replyMsgData) message_data = replyMsgData;
            } else if (element.picElement) {
                const PicMsgData = await this.obContext.apiContext.MsgApi.parsePicElement(msg, element);
                if (PicMsgData) message_data = PicMsgData;
            } else if (element.fileElement) {
                const FileMsgData = await this.obContext.apiContext.MsgApi.parseFileElement(msg, element);
                if (FileMsgData) message_data = FileMsgData;
            } else if (element.videoElement) {
                const videoMsgData = await this.obContext.apiContext.MsgApi.parseVideoElement(msg, element);
                if (videoMsgData) message_data = videoMsgData;
            } else if (element.pttElement) {
                const pttMsgData = await this.obContext.apiContext.MsgApi.parsePTTElement(msg, element);
                if (pttMsgData) message_data = pttMsgData;
            } else if (element.arkElement) {
                const arkMsgData = await this.obContext.apiContext.MsgApi.parseArkElement(msg, element);
                if (arkMsgData) message_data = arkMsgData;
            } else if (element.faceElement) {
                const faceMsgData = await this.obContext.apiContext.MsgApi.parseFaceElement(msg, element);
                if (faceMsgData) message_data = faceMsgData;
            } else if (element.marketFaceElement) {
                const marketFaceMsgData = await this.obContext.apiContext.MsgApi.parseMarketFaceElement(msg, element);
                if (marketFaceMsgData) message_data = marketFaceMsgData;
            } else if (element.markdownElement) {
                message_data['type'] = OB11MessageDataType.markdown;
                message_data['data']['data'] = element.markdownElement.content;
            } else if (element.multiForwardMsgElement) {
                const multiForwardMsgData = await this.obContext.apiContext.MsgApi.parseMultForwardElement(msg, element, messagePostFormat);
                if (multiForwardMsgData) message_data = multiForwardMsgData;
            }
            if ((message_data.type as string) !== 'unknown' && message_data.data) {
                const cqCode = encodeCQCode(message_data);

                if (messagePostFormat === 'string') {
                    (resMsg.message as string) += cqCode;
                } else (resMsg.message as OB11MessageData[]).push(message_data);
                resMsg.raw_message += cqCode;
            }

        }
        resMsg.raw_message = resMsg.raw_message.trim();
        return resMsg;
    }

    async parseFileElement(msg: RawMessage, element: MessageElement) {
        const fileElement = element.fileElement;
        if (!fileElement) return undefined;
        const NTQQFileApi = this.coreContext.apis.FileApi;
        const message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        message_data['type'] = OB11MessageDataType.file;
        message_data['data']['file'] = fileElement.fileName;
        message_data['data']['path'] = fileElement.filePath;
        message_data['data']['url'] = fileElement.filePath;
        message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
        message_data['data']['file_size'] = fileElement.fileSize;
        await NTQQFileApi.addFileCache(
            {
                peerUid: msg.peerUid,
                chatType: msg.chatType,
                guildId: '',
            },
            msg.msgId,
            msg.msgSeq,
            msg.senderUid,
            element.elementId,
            element.elementType.toString(),
            fileElement.fileSize,
            fileElement.fileName
        );
        return message_data;
    }
    async parseTextElemntWithAt(msg: RawMessage, element: MessageElement) {
        const textElement = element.textElement;
        if (!textElement) return undefined;
        const NTQQUserApi = this.coreContext.apis.UserApi;
        let qq: `${number}` | 'all';
        // let name: string | undefined;
        if (textElement.atType == AtType.atAll) {
            qq = 'all';
        } else {
            const { atNtUid, content } = textElement;
            let atQQ = textElement.atUid;
            if (!atQQ || atQQ === '0') {
                atQQ = await NTQQUserApi.getUinByUidV2(atNtUid);
            }
            if (atQQ) {
                qq = atQQ as `${number}`;
                // name = content.replace('@', '');
            }
        }
        
        return {
            type: OB11MessageDataType.at,
            data: {
                qq: qq!,
                // name,
            },
        };
    }
    async parseTextElement(msg: RawMessage, element: MessageElement) {
        const textElement = element.textElement;
        if (!textElement) return undefined;
        const message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        message_data['type'] = OB11MessageDataType.text;

        let text = textElement.content;
        if (!text.trim()) {
            return false;
        }
        // 兼容 9.7.x 换行符
        if (text.indexOf('\n') === -1 && text.indexOf('\r\n') === -1) {
            text = text.replace(/\r/g, '\n');
        }
        message_data['data']['text'] = text;
        return message_data;
    }
    async parsePicElement(msg: RawMessage, element: MessageElement) {
        const picElement = element.picElement;
        if (!picElement) return undefined;
        const NTQQFileApi = this.coreContext.apis.FileApi;
        const message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        message_data['type'] = OB11MessageDataType.image;
        // message_data["data"]["file"] = element.picElement.sourcePath
        message_data['data']['file'] = picElement.fileName;
        message_data['data']['subType'] = picElement.picSubType;
        message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
        // message_data["data"]["path"] = element.picElement.sourcePath
        try {
            message_data['data']['url'] = await NTQQFileApi.getImageUrl(picElement);
        } catch (e: any) {
            this.coreContext.context.logger.logError('获取图片url失败', e.stack);
        }
        //console.log(message_data['data']['url'])
        // message_data["data"]["file_id"] = element.picElement.fileUuid
        message_data['data']['file_size'] = picElement.fileSize;
        return message_data;
    }
    async parseMarketFaceElement(msg: RawMessage, element: MessageElement) {
        const NTQQFileApi = this.coreContext.apis.FileApi;
        const message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        message_data['type'] = OB11MessageDataType.image;
        message_data['data']['file'] = 'marketface';
        message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
        message_data['data']['path'] = element.elementId;
        message_data['data']['url'] = element.elementId;
        await NTQQFileApi.addFileCache(
            {
                peerUid: msg.peerUid,
                chatType: msg.chatType,
                guildId: '',
            },
            msg.msgId,
            msg.msgSeq,
            msg.senderUid,
            element.elementId,
            element.elementType.toString(),
            '0',
            'marketface'
        );
        return message_data;
    }
    async parseReplyElement(msg: RawMessage, element: MessageElement) {
        const replyElement = element.replyElement;
        if (!replyElement) return undefined;
        const NTQQMsgApi = this.coreContext.apis.MsgApi;
        const message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        message_data['type'] = OB11MessageDataType.reply;
        //log("收到回复消息", element.replyElement);
        try {
            const records = msg.records.find(msgRecord => msgRecord.msgId === replyElement?.sourceMsgIdInRecords);
            const peer = {
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '',
            };
            let replyMsg: RawMessage | undefined;
            if (!records) throw new Error('找不到回复消息');
            replyMsg = (await NTQQMsgApi.getMsgsBySeqAndCount({
                peerUid: msg.peerUid,
                guildId: '',
                chatType: msg.chatType,
            }, replyElement.replayMsgSeq, 1, true, true)).msgList.find(msg => msg.msgRandom === records.msgRandom);
            if (!replyMsg || records.msgRandom !== replyMsg.msgRandom) {
                replyMsg = (await NTQQMsgApi.getSingleMsg(peer, replyElement.replayMsgSeq)).msgList[0];
            }
            if (msg.peerUin == '284840486') {
                //合并消息内侧 消息具体定位不到
            }
            if ((!replyMsg || records.msgRandom !== replyMsg.msgRandom) && msg.peerUin !== '284840486') {
                const replyMsgList = (await NTQQMsgApi.getMsgExBySeq(peer, records.msgSeq)).msgList;
                if (replyMsgList.length < 1) {
                    throw new Error('回复消息消息验证失败');
                }
                replyMsg = replyMsgList.filter(e => e.msgSeq == records.msgSeq).sort((a, b) => parseInt(a.msgTime) - parseInt(b.msgTime))[0];
            }
            message_data['data']['id'] = MessageUnique.createMsg({
                peerUid: msg.peerUid,
                guildId: '',
                chatType: msg.chatType,
            }, replyMsg.msgId)?.toString();
            //log("找到回复消息", message_data['data']['id'], replyMsg.msgList[0].msgId)
        } catch (e: any) {
            message_data['type'] = 'unknown' as any;
            message_data['data'] = undefined;
            this.coreContext.context.logger.logError('获取不到引用的消息', e.stack, replyElement.replayMsgSeq);
            return undefined;
        }
        return message_data;
    }
    async parseVideoElement(msg: RawMessage, element: MessageElement) {
        const videoElement = element.videoElement;
        if (!videoElement) return undefined;
        const NTQQFileApi = this.coreContext.apis.FileApi;
        const message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        //读取视频链接并兜底
        let videoUrl; //Array
        if (msg.peerUin === '284840486') {
            //合并消息内部 应该进行特殊处理 可能需要重写peer 待测试与研究 Mlikiowa Taged TODO
        }
        try {

            videoUrl = await NTQQFileApi.getVideoUrl({
                chatType: msg.chatType,
                peerUid: msg.peerUid,
                guildId: '0',
            }, msg.msgId, element.elementId);
        } catch (error) {
            videoUrl = undefined;
        }
        //读取在线URL
        let videoDownUrl = undefined;

        if (videoUrl) {
            const videoDownUrlTemp = videoUrl.find((url) => {
                return !!url.url;
            });
            if (videoDownUrlTemp) {
                videoDownUrl = videoDownUrlTemp.url;
            }
        }
        //开始兜底
        if (!videoDownUrl) {
            videoDownUrl = videoElement.filePath;
        }
        message_data['type'] = OB11MessageDataType.video;
        message_data['data']['file'] = videoElement.fileName;
        message_data['data']['path'] = videoDownUrl;
        message_data['data']['url'] = videoDownUrl;
        message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
        message_data['data']['file_size'] = videoElement.fileSize;

        await NTQQFileApi.addFileCache(
            {
                peerUid: msg.peerUid,
                chatType: msg.chatType,
                guildId: '',
            },
            msg.msgId,
            msg.msgSeq,
            msg.senderUid,
            element.elementId,
            element.elementType.toString(),
            videoElement.fileSize || '0',
            videoElement.fileName
        );
        return message_data;
    }
    async parsePTTElement(msg: RawMessage, element: MessageElement) {
        const pttElement = element.pttElement;
        if (!pttElement) return undefined;
        const NTQQFileApi = this.coreContext.apis.FileApi;
        const message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };

        message_data['type'] = OB11MessageDataType.voice;
        message_data['data']['file'] = pttElement.fileName;
        message_data['data']['path'] = pttElement.filePath;
        //message_data['data']['file_id'] = element.pttElement.fileUuid;
        message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
        message_data['data']['file_size'] = pttElement.fileSize;
        await NTQQFileApi.addFileCache({
            peerUid: msg.peerUid,
            chatType: msg.chatType,
            guildId: '',
        },
        msg.msgId,
        msg.msgSeq,
        msg.senderUid,
        element.elementId,
        element.elementType.toString(),
        pttElement.fileSize || '0',
        pttElement.fileUuid || ''
        );
        //以uuid作为文件名
        return message_data;
    }
    async parseFaceElement(msg: RawMessage, element: MessageElement) {
        const faceElement = element.faceElement;
        if (!faceElement) return undefined;
        const message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        const faceId = faceElement.faceIndex;
        if (faceId === FaceIndex.dice) {
            message_data['type'] = OB11MessageDataType.dice;
            message_data['data']['result'] = faceElement.resultId;
        } else if (faceId === FaceIndex.RPS) {
            message_data['type'] = OB11MessageDataType.RPS;
            message_data['data']['result'] = faceElement.resultId;
        } else {
            message_data['type'] = OB11MessageDataType.face;
            message_data['data']['id'] = faceElement.faceIndex.toString();
        }
        return message_data;
    }
    async parseMultForwardElement(msg: RawMessage, element: MessageElement, messagePostFormat: any) {
        const NTQQMsgApi = this.coreContext.apis.MsgApi;
        const faceElement = element.multiForwardMsgElement;
        if (!faceElement) return undefined;
        const message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        message_data['type'] = OB11MessageDataType.forward;
        message_data['data']['id'] = msg.msgId;
        const ParentMsgPeer = msg.parentMsgPeer ?? {
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
        const MultiMsgs = (await NTQQMsgApi.getMultiMsg(ParentMsgPeer, msg.parentMsgIdList[0], msg.msgId))?.msgList;
        //拉取下级消息
        if (!MultiMsgs) return undefined;
        //拉取失败则跳过
        message_data['data']['content'] = [];
        for (const MultiMsg of MultiMsgs) {
            //对每条拉取的消息传递ParentMsgPeer修正Peer
            MultiMsg.parentMsgPeer = ParentMsgPeer;
            MultiMsg.parentMsgIdList = msg.parentMsgIdList;
            MultiMsg.id = MessageUnique.createMsg(ParentMsgPeer, MultiMsg.msgId); //该ID仅用查看 无法调用
            const msgList = await this.parseMessage(MultiMsg, messagePostFormat);
            if (!msgList) continue;
            message_data['data']['content'].push(msgList);
            //console.log("合并消息", msgList);
        }
        return message_data;
    }
    async parseArkElement(msg: RawMessage, element: MessageElement) {
        const arkElement = element.arkElement;
        if (!arkElement) return undefined;
        const message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        message_data['type'] = OB11MessageDataType.json;
        message_data['data']['data'] = arkElement.bytesData;
        return message_data;
    }
}
