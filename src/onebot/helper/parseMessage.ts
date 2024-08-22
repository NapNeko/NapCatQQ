import fastXmlParser from 'fast-xml-parser';
import { OB11GroupIncreaseEvent } from '../event/notice/OB11GroupIncreaseEvent';
import { OB11GroupBanEvent } from '../event/notice/OB11GroupBanEvent';
import { sleep, UUIDConverter } from '@/common/utils/helper';
import { OB11GroupMsgEmojiLikeEvent } from '@/onebot/event/notice/OB11MsgEmojiLikeEvent';
import { OB11FriendPokeEvent } from '../event/notice/OB11PokeEvent';
import { NapCatOneBot11Adapter, OB11Message, OB11MessageData, OB11MessageDataType } from '..';
import { AtType, ChatType, FaceIndex, NapCatCore, RawMessage, VideoElement } from '@/core';
import { EventType } from '../event/OB11BaseEvent';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { OB11Constructor } from './converter';
import { encodeCQCode } from './cqcode';


export async function RawNTMsg2Onebot(
    core: NapCatCore,
    obcore: NapCatOneBot11Adapter,
    msg: RawMessage,
    messagePostFormat: string = obcore.configLoader.configData.messagePostFormat
): Promise<OB11Message | undefined> {
    if (msg.senderUin == "0" || msg.senderUin == "") return;
    if (msg.peerUin == "0" || msg.peerUin == "") return;
    //跳过空消息
    const NTQQGroupApi = core.apis.GroupApi;
    const NTQQUserApi = core.apis.UserApi;
    const NTQQFileApi = core.apis.FileApi;
    const NTQQMsgApi = core.apis.MsgApi;
    const logger = core.context.logger;
    const resMsg: OB11Message = {
        self_id: parseInt(core.selfInfo.uin),
        user_id: parseInt(msg.senderUin!),
        time: parseInt(msg.msgTime) || Date.now(),
        message_id: msg.id!,
        message_seq: msg.id!,
        real_id: msg.id!,
        message_type: msg.chatType == ChatType.group ? 'group' : 'private',
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
        post_type: core.selfInfo.uin == msg.senderUin ? EventType.MESSAGE_SENT : EventType.MESSAGE,
    };
    if (msg.chatType == ChatType.group) {
        resMsg.sub_type = 'normal'; // 这里go-cqhttp是group，而onebot11标准是normal, 蛋疼
        resMsg.group_id = parseInt(msg.peerUin);
        //直接去QQNative取
        let member = await NTQQGroupApi.getGroupMember(msg.peerUin, msg.senderUin);
        if (!member) member = await NTQQGroupApi.getGroupMember(msg.peerUin, msg.senderUin);
        if (member) {
            resMsg.sender.role = OB11Constructor.groupMemberRole(member.role);
            resMsg.sender.nickname = member.nick;
        }
    } else if (msg.chatType == ChatType.friend) {
        resMsg.sub_type = 'friend';
        resMsg.sender.nickname = (await NTQQUserApi.getUserDetailInfo(msg.senderUid)).nick;
        //const user = await NTQQUserApi.getUserDetailInfoByUin(msg.senderUin!);
        //resMsg.sender.nickname = user.info.nick;
    } else if (msg.chatType == ChatType.temp) {
        resMsg.sub_type = 'group';
        const ret = await NTQQMsgApi.getTempChatInfo(ChatType.temp, msg.senderUid);
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
            let textAtMsgData = await obcore.apiContext.MsgApi.paseTextElemntWithAt(msg, element.textElement);
            if (textAtMsgData) message_data = textAtMsgData
        } else if (element.textElement) {
            let textMsgData = await obcore.apiContext.MsgApi.parseTextElement(msg, element.textElement);
            if (textMsgData) message_data = textMsgData;
        } else if (element.replyElement) {
            let replyMsgData = await obcore.apiContext.MsgApi.parseReplyElement(msg, element.replyElement);
            if (replyMsgData) message_data = replyMsgData;

        } else if (element.picElement) {
            let PicMsgData = await obcore.apiContext.MsgApi.parsePicElement(msg, element.picElement);
            if (PicMsgData) message_data = PicMsgData;

        } else if (element.fileElement) {
            const FileElement = element.fileElement;
            message_data['type'] = OB11MessageDataType.file;
            message_data['data']['file'] = FileElement.fileName;
            message_data['data']['path'] = FileElement.filePath;
            message_data['data']['url'] = FileElement.filePath;
            message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
            message_data['data']['file_size'] = FileElement.fileSize;
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
                FileElement.fileSize,
                FileElement.fileName
            );
        } else if (element.videoElement) {
            let videoMsgData = await obcore.apiContext.MsgApi.parseVideoElement(msg, element.elementId, element.elementType, element.videoElement);
            if (videoMsgData) message_data = videoMsgData;
        } else if (element.pttElement) {
            message_data['type'] = OB11MessageDataType.voice;
            message_data['data']['file'] = element.pttElement.fileName;
            message_data['data']['path'] = element.pttElement.filePath;
            //message_data['data']['file_id'] = element.pttElement.fileUuid;
            message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
            message_data['data']['file_size'] = element.pttElement.fileSize;
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
                element.pttElement.fileSize || '0',
                element.pttElement.fileUuid || ''
            );
            //以uuid作为文件名
        } else if (element.arkElement) {
            message_data['type'] = OB11MessageDataType.json;
            message_data['data']['data'] = element.arkElement.bytesData;
        } else if (element.faceElement) {
            const faceId = element.faceElement.faceIndex;
            if (faceId === FaceIndex.dice) {
                message_data['type'] = OB11MessageDataType.dice;
                message_data['data']['result'] = element.faceElement.resultId;
            } else if (faceId === FaceIndex.RPS) {
                message_data['type'] = OB11MessageDataType.RPS;
                message_data['data']['result'] = element.faceElement.resultId;
            } else {
                message_data['type'] = OB11MessageDataType.face;
                message_data['data']['id'] = element.faceElement.faceIndex.toString();
            }
        } else if (element.marketFaceElement) {
            let marketFaceMsgData = await obcore.apiContext.MsgApi.parseMarketFaceElement(msg, element.elementId, element.elementType, element.marketFaceElement);
            if (marketFaceMsgData) message_data = marketFaceMsgData;
        } else if (element.markdownElement) {
            message_data['type'] = OB11MessageDataType.markdown;
            message_data['data']['data'] = element.markdownElement.content;
        } else if (element.multiForwardMsgElement) {
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
            if (!MultiMsgs) continue;
            //拉取失败则跳过
            message_data['data']['content'] = [];
            for (const MultiMsg of MultiMsgs) {
                //对每条拉取的消息传递ParentMsgPeer修正Peer
                MultiMsg.parentMsgPeer = ParentMsgPeer;
                MultiMsg.parentMsgIdList = msg.parentMsgIdList;
                MultiMsg.id = MessageUnique.createMsg(ParentMsgPeer, MultiMsg.msgId); //该ID仅用查看 无法调用
                const msgList = await RawNTMsg2Onebot(core, obcore, MultiMsg, messagePostFormat);
                if (!msgList) continue;
                message_data['data']['content'].push(msgList);
                //console.log("合并消息", msgList);
            }
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
