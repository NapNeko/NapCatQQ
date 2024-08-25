import {
    OB11MessageData,
    OB11MessageDataType,
    OB11MessageMixType,
    OB11MessageNode,
    OB11PostSendMsg,
} from '@/onebot/types';
import { ActionName, BaseCheckResult } from '@/onebot/action/types';
import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import { decodeCQCode } from '@/onebot/helper/cqcode';
import createSendElements from './create-send-elements';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { ChatType, ElementType, NapCatCore, Peer, SendMessageElement } from '@/core';
import BaseAction from '../../BaseAction';
import { handleForwardNode } from './handle-forward-node';

export interface ReturnDataType {
    message_id: number;
}

export enum ContextMode {
    Normal = 0,
    Private = 1,
    Group = 2
}

// Normalizes a mixed type (CQCode/a single segment/segment array) into a segment array.
export function normalize(message: OB11MessageMixType, autoEscape = false): OB11MessageData[] {
    return typeof message === 'string' ? (
        autoEscape ?
            [{ type: OB11MessageDataType.text, data: { text: message } }] :
            decodeCQCode(message)
    ) : Array.isArray(message) ? message : [message];
}

export { createSendElements };

export async function sendMsg(coreContext: NapCatCore, peer: Peer, sendElements: SendMessageElement[], deleteAfterSentFiles: string[], waitComplete = true) {
    const NTQQMsgApi = coreContext.apis.MsgApi;
    const logger = coreContext.context.logger;
    if (!sendElements.length) {
        throw ('消息体无法解析, 请检查是否发送了不支持的消息类型');
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
        logger.logError('发送消息计算预计时间异常', e);
    }
    const returnMsg = await NTQQMsgApi.sendMsg(peer, sendElements, waitComplete, timeout);
    try {
        returnMsg!.id = MessageUnique.createMsg({
            chatType: peer.chatType,
            guildId: '',
            peerUid: peer.peerUid,
        }, returnMsg!.msgId);
    } catch (e: any) {
        logger.logDebug('发送消息id获取失败', e);
        returnMsg!.id = 0;
    }
    deleteAfterSentFiles.map((f) => {
        fsPromise.unlink(f).then().catch(e => logger.logError('发送消息删除文件失败', e));
    });
    return returnMsg;
}

async function createContext(coreContext: NapCatCore, payload: OB11PostSendMsg, contextMode: ContextMode): Promise<Peer> {
    // This function determines the type of message by the existence of user_id / group_id,
    // not message_type.
    // This redundant design of Ob11 here should be blamed.
    const NTQQFriendApi = coreContext.apis.FriendApi;
    const NTQQUserApi = coreContext.apis.UserApi;
    const NTQQMsgApi = coreContext.apis.MsgApi;
    if ((contextMode === ContextMode.Group || contextMode === ContextMode.Normal) && payload.group_id) {
        return {
            chatType: ChatType.KCHATTYPEGROUP,
            peerUid: payload.group_id.toString(),
        };
    }
    if ((contextMode === ContextMode.Private || contextMode === ContextMode.Normal) && payload.user_id) {
        const Uid = await NTQQUserApi.getUidByUinV2(payload.user_id.toString());
        if (!Uid) throw '无法获取用户信息';
        const isBuddy = await NTQQFriendApi.isBuddy(Uid);
        if (!isBuddy) {
            const ret = await NTQQMsgApi.getTempChatInfo(ChatType.KCHATTYPETEMPC2CFROMGROUP, Uid);
            if (ret.tmpChatInfo?.groupCode) {
                return {
                    chatType: ChatType.KCHATTYPETEMPC2CFROMGROUP,
                    peerUid: Uid,
                    guildId: '',
                };
            }
            if (payload.group_id) {
                return {
                    chatType: ChatType.KCHATTYPETEMPC2CFROMGROUP,
                    peerUid: Uid,
                    guildId: payload.group_id.toString(),
                };
            }
            return {
                chatType: ChatType.KCHATTYPEC2C,
                peerUid: Uid!,
                guildId: '',
            };
        }
        return {
            chatType: ChatType.KCHATTYPEC2C,
            peerUid: Uid!,
            guildId: '',
        };
    }
    throw '请指定 group_id 或 user_id';
}

function getSpecialMsgNum(payload: OB11PostSendMsg, msgType: OB11MessageDataType): number {
    if (Array.isArray(payload.message)) {
        return payload.message.filter(msg => msg.type == msgType).length;
    }
    return 0;
}

export class SendMsg extends BaseAction<OB11PostSendMsg, ReturnDataType> {
    actionName = ActionName.SendMsg;
    contextMode = ContextMode.Normal;

    protected async check(payload: OB11PostSendMsg): Promise<BaseCheckResult> {
        const NTQQGroupApi = this.CoreContext.apis.GroupApi;
        const NTQQFriendApi = this.CoreContext.apis.FriendApi;
        const NTQQUserApi = this.CoreContext.apis.UserApi;
        const messages = normalize(payload.message);
        const nodeElementLength = getSpecialMsgNum(payload, OB11MessageDataType.node);
        if (nodeElementLength > 0 && nodeElementLength != messages.length) {
            return {
                valid: false,
                message: '转发消息不能和普通消息混在一起发送,转发需要保证message只有type为node的元素',
            };
        }
        if (payload.user_id && payload.message_type !== 'group') {
            const uid = await NTQQUserApi.getUidByUinV2(payload.user_id.toString());
            const isBuddy = await NTQQFriendApi.isBuddy(uid!);
            //if (!isBuddy) { }
        }
        return { valid: true };
    }

    async _handle(payload: OB11PostSendMsg): Promise<{ message_id: number }> {
        if (payload.message_type === 'group') this.contextMode = ContextMode.Group;
        if (payload.message_type === 'private') this.contextMode = ContextMode.Private;
        const peer = await createContext(this.CoreContext, payload, this.contextMode);

        const messages = normalize(
            payload.message,
            typeof payload.auto_escape === 'string' ? payload.auto_escape === 'true' : !!payload.auto_escape
        );

        if (getSpecialMsgNum(payload, OB11MessageDataType.node)) {
            const returnMsg = await handleForwardNode(this.CoreContext, this.OneBotContext, peer, messages as OB11MessageNode[]);
            if (returnMsg) {
                const msgShortId = MessageUnique.createMsg({
                    guildId: '',
                    peerUid: peer.peerUid,
                    chatType: peer.chatType,
                }, returnMsg!.msgId);
                return { message_id: msgShortId! };
            } else {
                throw Error('发送转发消息失败');
            }
        } else {
            // if (getSpecialMsgNum(payload, OB11MessageDataType.music)) {
            //   const music: OB11MessageCustomMusic = messages[0] as OB11MessageCustomMusic;
            //   if (music) {
            //   }
            // }
        }
        // log("send msg:", peer, sendElements)

        const { sendElements, deleteAfterSentFiles } = await createSendElements(this.CoreContext, this.OneBotContext, messages, peer);
        //console.log(peer, JSON.stringify(sendElements,null,2));
        const returnMsg = await sendMsg(this.CoreContext, peer, sendElements, deleteAfterSentFiles);
        return { message_id: returnMsg!.id! };
    }
}

export default SendMsg;
