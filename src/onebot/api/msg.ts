import { UUIDConverter } from '@/common/utils/helper';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { AtType, ElementWrapper, MessageElement, NapCatCore, PicElement, RawMessage, ReplyElement, TextElement } from '@/core';

import { NapCatOneBot11Adapter, OB11MessageData, OB11MessageDataType } from '@/onebot';

export class OneBotMsgApi {
    obContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;

    constructor(obContext: NapCatOneBot11Adapter, coreContext: NapCatCore) {
        this.obContext = obContext;
        this.coreContext = coreContext;
    }
    async paseTextElemntWithAt(msg: RawMessage, textElement: TextElement) {
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
    async parseTextElement(msg: RawMessage, textElement: TextElement) {
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
    async parsePicElement(msg: RawMessage, picElement: PicElement) {
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
    async parseReplyElement(msg: RawMessage, replyElement: ReplyElement) {
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
}
