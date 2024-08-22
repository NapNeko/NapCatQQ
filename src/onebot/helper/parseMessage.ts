import { UUIDConverter } from '@/common/utils/helper';
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
            let textAtMsgData = await obcore.apiContext.MsgApi.parseTextElemntWithAt(msg, element);
            if (textAtMsgData) message_data = textAtMsgData
        } else if (element.textElement) {
            let textMsgData = await obcore.apiContext.MsgApi.parseTextElement(msg, element);
            if (textMsgData) message_data = textMsgData;
        } else if (element.replyElement) {
            let replyMsgData = await obcore.apiContext.MsgApi.parseReplyElement(msg, element);
            if (replyMsgData) message_data = replyMsgData;
        } else if (element.picElement) {
            let PicMsgData = await obcore.apiContext.MsgApi.parsePicElement(msg, element);
            if (PicMsgData) message_data = PicMsgData;
        } else if (element.fileElement) {
            let FileMsgData = await obcore.apiContext.MsgApi.parseFileElement(msg, element);
            if (FileMsgData) message_data = FileMsgData;
        } else if (element.videoElement) {
            let videoMsgData = await obcore.apiContext.MsgApi.parseVideoElement(msg, element);
            if (videoMsgData) message_data = videoMsgData;
        } else if (element.pttElement) {
            let pttMsgData = await obcore.apiContext.MsgApi.parsePTTElement(msg, element);
            if (pttMsgData) message_data = pttMsgData;
        } else if (element.arkElement) {
            let arkMsgData = await obcore.apiContext.MsgApi.parseArkElement(msg, element);
            if (arkMsgData) message_data = arkMsgData;
        } else if (element.faceElement) {
            let faceMsgData = await obcore.apiContext.MsgApi.parseFaceElement(msg, element);
            if (faceMsgData) message_data = faceMsgData;
        } else if (element.marketFaceElement) {
            let marketFaceMsgData = await obcore.apiContext.MsgApi.parseMarketFaceElement(msg, element);
            if (marketFaceMsgData) message_data = marketFaceMsgData;
        } else if (element.markdownElement) {
            message_data['type'] = OB11MessageDataType.markdown;
            message_data['data']['data'] = element.markdownElement.content;
        } else if (element.multiForwardMsgElement) {
            let multiForwardMsgData = await obcore.apiContext.MsgApi.parseMultForwardElement(msg, element, messagePostFormat);
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
