import {
    OB11MessageData,
    OB11MessageDataType,
    OB11MessageMixType,
    OB11MessageNode,
    OB11PostSendMsg,
} from '@/onebot/types';
import { ActionName, BaseCheckResult } from '@/onebot/action/types';
import { decodeCQCode } from '@/onebot/helper/cqcode';
import { MessageUnique } from '@/common/utils/message-unique';
import { ChatType, ElementType, NapCatCore, Peer, RawMessage, SendMessageElement } from '@/core';
import BaseAction from '../BaseAction';

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

async function createContext(core: NapCatCore, payload: OB11PostSendMsg, contextMode: ContextMode): Promise<Peer> {
    // This function determines the type of message by the existence of user_id / group_id,
    // not message_type.
    // This redundant design of Ob11 here should be blamed.
    const NTQQFriendApi = core.apis.FriendApi;
    const NTQQUserApi = core.apis.UserApi;
    const NTQQMsgApi = core.apis.MsgApi;
    if ((contextMode === ContextMode.Group || contextMode === ContextMode.Normal) && payload.group_id) {
        return {
            chatType: ChatType.KCHATTYPEGROUP,
            peerUid: payload.group_id.toString(),
        };
    }
    if ((contextMode === ContextMode.Private || contextMode === ContextMode.Normal) && payload.user_id) {
        const Uid = await NTQQUserApi.getUidByUinV2(payload.user_id.toString());
        if (!Uid) throw new Error('无法获取用户信息');
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
    throw new Error('请指定 group_id 或 user_id');
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
        const messages = normalize(payload.message);
        const nodeElementLength = getSpecialMsgNum(payload, OB11MessageDataType.node);
        if (nodeElementLength > 0 && nodeElementLength != messages.length) {
            return {
                valid: false,
                message: '转发消息不能和普通消息混在一起发送,转发需要保证message只有type为node的元素',
            };
        }
        if (payload.user_id && payload.message_type !== 'group') {
            // const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
            // const isBuddy = await NTQQFriendApi.isBuddy(uid!);
            // if (!isBuddy) { }
        }
        return { valid: true };
    }

    async _handle(payload: OB11PostSendMsg): Promise<{ message_id: number }> {
        if (payload.message_type === 'group') this.contextMode = ContextMode.Group;
        if (payload.message_type === 'private') this.contextMode = ContextMode.Private;
        const peer = await createContext(this.core, payload, this.contextMode);

        const messages = normalize(
            payload.message,
            typeof payload.auto_escape === 'string' ? payload.auto_escape === 'true' : !!payload.auto_escape
        );

        if (getSpecialMsgNum(payload, OB11MessageDataType.node)) {
            const returnMsg = await this.handleForwardedNodes(peer, messages as OB11MessageNode[]);
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

        const { sendElements, deleteAfterSentFiles } = await this.obContext.apis.MsgApi
            .createSendElements(messages, peer);
        const returnMsg = await this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(peer, sendElements, deleteAfterSentFiles);
        return { message_id: returnMsg!.id! };
    }

    private async handleForwardedNodes(destPeer: Peer, messageNodes: OB11MessageNode[]): Promise<RawMessage | null> {
        const NTQQMsgApi = this.core.apis.MsgApi;
        const selfPeer = {
            chatType: ChatType.KCHATTYPEC2C,
            peerUid: this.core.selfInfo.uid,
        };
        let nodeMsgIds: string[] = [];
        const logger = this.core.context.logger;
        for (const messageNode of messageNodes) {
            const nodeId = messageNode.data.id;
            if (nodeId) {
                //对Mgsid和OB11ID混用情况兜底
                const nodeMsg = MessageUnique.getMsgIdAndPeerByShortId(parseInt(nodeId)) || MessageUnique.getPeerByMsgId(nodeId);
                if (!nodeMsg) {
                    logger.logError('转发消息失败，未找到消息', nodeId);
                    continue;
                }
                nodeMsgIds.push(nodeMsg.MsgId);
            } else {
                // 自定义的消息
                try {
                    const OB11Data = normalize(messageNode.data.content);
                    //筛选node消息
                    const isNodeMsg = OB11Data.filter(e => e.type === OB11MessageDataType.node).length;//找到子转发消息
                    if (isNodeMsg !== 0) {
                        if (isNodeMsg !== OB11Data.length) {
                            logger.logError('子消息中包含非node消息 跳过不合法部分');
                            continue;
                        }
                        const nodeMsg = await this.handleForwardedNodes(selfPeer, OB11Data.filter(e => e.type === OB11MessageDataType.node));
                        if (nodeMsg) {
                            nodeMsgIds.push(nodeMsg.msgId);
                            MessageUnique.createMsg(selfPeer, nodeMsg.msgId);
                        }
                        //完成子卡片生成跳过后续
                        continue;
                    }
                    const { sendElements } = await this.obContext.apis.MsgApi
                        .createSendElements(OB11Data, destPeer);
                    //拆分消息
                    const MixElement = sendElements.filter(element => element.elementType !== ElementType.FILE && element.elementType !== ElementType.VIDEO);
                    const SingleElement = sendElements.filter(element => element.elementType === ElementType.FILE || element.elementType === ElementType.VIDEO).map(e => [e]);
                    const AllElement: SendMessageElement[][] = [MixElement, ...SingleElement].filter(e => e !== undefined && e.length !== 0);
                    const MsgNodeList: Promise<RawMessage | undefined>[] = [];
                    for (const sendElementsSplitElement of AllElement) {
                        MsgNodeList.push(this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(selfPeer, sendElementsSplitElement, [], true).catch(_ => undefined));
                    }
                    (await Promise.allSettled(MsgNodeList)).map((result) => {
                        if (result.status === 'fulfilled' && result.value) {
                            nodeMsgIds.push(result.value.msgId);
                            MessageUnique.createMsg(selfPeer, result.value.msgId);
                        }
                    });
                } catch (e) {
                    logger.logDebug('生成转发消息节点失败', e);
                }
            }
        }
        const nodeMsgArray: Array<RawMessage> = [];
        let srcPeer: Peer | undefined = undefined;
        let needSendSelf = false;
        //检测是否处于同一个Peer 不在同一个peer则全部消息由自身发送
        for (const msgId of nodeMsgIds) {
            const nodeMsgPeer = MessageUnique.getPeerByMsgId(msgId);
            if (!nodeMsgPeer) {
                logger.logError('转发消息失败，未找到消息', msgId);
                continue;
            }
            const nodeMsg = (await NTQQMsgApi.getMsgsByMsgId(nodeMsgPeer.Peer, [msgId])).msgList[0];
            srcPeer = srcPeer ?? { chatType: nodeMsg.chatType, peerUid: nodeMsg.peerUid };
            if (srcPeer.peerUid !== nodeMsg.peerUid) {
                needSendSelf = true;
            }
            nodeMsgArray.push(nodeMsg);
        }
        nodeMsgIds = nodeMsgArray.map(msg => msg.msgId);
        let retMsgIds: string[] = [];
        if (needSendSelf) {
            for (const [, msg] of nodeMsgArray.entries()) {
                if (msg.peerUid === this.core.selfInfo.uid) {
                    retMsgIds.push(msg.msgId);
                    continue;
                }
                const ClonedMsg = await this.cloneMsg(msg);
                if (ClonedMsg) retMsgIds.push(ClonedMsg.msgId);
            }
        } else {
            retMsgIds = nodeMsgIds;
        }
        if (retMsgIds.length === 0) throw Error('转发消息失败，生成节点为空');
        try {
            logger.logDebug('开发转发', srcPeer, destPeer, retMsgIds);
            return await NTQQMsgApi.multiForwardMsg(srcPeer!, destPeer, retMsgIds);
        } catch (e) {
            logger.logError('forward failed', e);
            return null;
        }
    }

    async cloneMsg(msg: RawMessage): Promise<RawMessage | undefined> {
        const selfPeer = {
            chatType: ChatType.KCHATTYPEC2C,
            peerUid: this.core.selfInfo.uid,
        };
        const logger = this.core.context.logger;
        const NTQQMsgApi = this.core.apis.MsgApi;
        //msg 为待克隆消息

        const sendElements: SendMessageElement[] = [];

        for (const element of msg.elements) {
            sendElements.push(element as SendMessageElement);
        }

        if (sendElements.length === 0) {
            logger.logDebug('需要clone的消息无法解析，将会忽略掉', msg);
        }
        try {
            return await NTQQMsgApi.sendMsg(selfPeer, sendElements, true);
        } catch (e) {
            logger.logError(e, '克隆转发消息失败,将忽略本条消息', msg);
        }
    }
}

export default SendMsg;
