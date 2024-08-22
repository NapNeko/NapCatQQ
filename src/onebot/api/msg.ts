import { UUIDConverter } from '@/common/utils/helper';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { AtType, FaceIndex, MessageElement, NapCatCore, RawMessage } from '@/core';
import { NapCatOneBot11Adapter, OB11MessageData, OB11MessageDataType } from '@/onebot';
import { RawNTMsg2Onebot } from '../helper';

export class OneBotMsgApi {
    obContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;

    constructor(obContext: NapCatOneBot11Adapter, coreContext: NapCatCore) {
        this.obContext = obContext;
        this.coreContext = coreContext;
    }
    async parseFileElement(msg: RawMessage, element: MessageElement) {
        const fileElement = element.fileElement;
        if (!fileElement) return undefined;
        const NTQQFileApi = this.coreContext.apis.FileApi;
        let message_data: OB11MessageData = {
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
        let message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        let qq: `${number}` | 'all';
        let name: string | undefined;
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
                name = content.replace('@', '');
            }
        }
        message_data = {
            type: OB11MessageDataType.at,
            data: {
                qq: qq!,
                name,
            },
        };
        return message_data;
    }
    async parseTextElement(msg: RawMessage, element: MessageElement) {
        const textElement = element.textElement;
        if (!textElement) return undefined;
        let message_data: OB11MessageData = {
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
        let message_data: OB11MessageData = {
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
        let message_data: OB11MessageData = {
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
        let message_data: OB11MessageData = {
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
        let message_data: OB11MessageData = {
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
        let message_data: OB11MessageData = {
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
        let message_data: OB11MessageData = {
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
        let message_data: OB11MessageData = {
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
            const msgList = await RawNTMsg2Onebot(this.coreContext, this.obContext, MultiMsg, messagePostFormat);
            if (!msgList) continue;
            message_data['data']['content'].push(msgList);
            //console.log("合并消息", msgList);
        }
        return message_data;
    }
    async parseArkElement(msg: RawMessage, element: MessageElement) {
        const arkElement = element.arkElement;
        if (!arkElement) return undefined;
        let message_data: OB11MessageData = {
            data: {} as any,
            type: 'unknown' as any,
        };
        message_data['type'] = OB11MessageDataType.json;
        message_data['data']['data'] = arkElement.bytesData;
        return message_data;
    }
}
