import {
    OB11MessageData,
    OB11MessageDataType,
    OB11MessageMixType,
    OB11MessageNode,
    OB11PostContext,
    OB11PostSendMsg,
} from '@/onebot/types';
import { ActionName, BaseCheckResult } from '@/onebot/action/router';
import { decodeCQCode } from '@/onebot/helper/cqcode';
import { MessageUnique } from '@/common/message-unique';
import { ChatType, ElementType, NapCatCore, Peer, RawMessage, SendArkElement, SendMessageElement } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ForwardMsgBuilder } from '@/common/forward-msg-builder';
import { stringifyWithBigInt } from '@/common/helper';
import { PacketMsg } from '@/core/packet/message/message';
import { rawMsgWithSendMsg } from '@/core/packet/message/converter';

export interface ReturnDataType {
    message_id: number;
    res_id?: string;
    forward_id?: string;
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

export async function createContext(core: NapCatCore, payload: OB11PostContext | undefined, contextMode: ContextMode = ContextMode.Normal): Promise<Peer> {
    if (!payload) {
        throw new Error('请传递请求内容');
    }
    if ((contextMode === ContextMode.Group || contextMode === ContextMode.Normal) && payload.group_id) {
        return {
            chatType: ChatType.KCHATTYPEGROUP,
            peerUid: payload.group_id.toString(),
        };
    }
    if ((contextMode === ContextMode.Private || contextMode === ContextMode.Normal) && payload.user_id) {
        const Uid = await core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!Uid) {
            if (payload.group_id) {
                return {
                    chatType: ChatType.KCHATTYPEGROUP,
                    peerUid: payload.group_id.toString(),
                    guildId: ''
                }
            }
            throw new Error('无法获取用户信息');
        }
        const isBuddy = await core.apis.FriendApi.isBuddy(Uid);
        if (!isBuddy) {
            const ret = await core.apis.MsgApi.getTempChatInfo(ChatType.KCHATTYPETEMPC2CFROMGROUP, Uid);
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
                peerUid: Uid,
                guildId: '',
            };
        }
        return {
            chatType: ChatType.KCHATTYPEC2C,
            peerUid: Uid,
            guildId: '',
        };
    }
    if (contextMode === ContextMode.Private && payload.group_id) {
        throw new Error('当前私聊发送,请指定 user_id 而不是 group_id');
    }
    if (contextMode === ContextMode.Group && payload.user_id) {
        throw new Error('当前群聊发送,请指定 group_id 而不是 user_id');
    }
    throw new Error('请指定正确的 group_id 或 user_id');
}

function getSpecialMsgNum(payload: OB11PostSendMsg, msgType: OB11MessageDataType): number {
    if (Array.isArray(payload.message)) {
        return payload.message.filter(msg => msg.type == msgType).length;
    }
    return 0;
}

export class SendMsgBase extends OneBotAction<OB11PostSendMsg, ReturnDataType> {
    protected override async check(payload: OB11PostSendMsg): Promise<BaseCheckResult> {
        const messages = normalize(payload.message);
        const nodeElementLength = getSpecialMsgNum(payload, OB11MessageDataType.node);
        if (nodeElementLength > 0 && nodeElementLength != messages.length) {
            return {
                valid: false,
                message: '转发消息不能和普通消息混在一起发送,转发需要保证message只有type为node的元素',
            };
        }
        return { valid: true };
    }
    async _handle(payload: OB11PostSendMsg): Promise<ReturnDataType> {
        return this.base_handle(payload);
    }
    async base_handle(payload: OB11PostSendMsg, contextMode: ContextMode = ContextMode.Normal): Promise<ReturnDataType> {
        if (payload.message_type === 'group') contextMode = ContextMode.Group;
        if (payload.message_type === 'private') contextMode = ContextMode.Private;
        const peer = await createContext(this.core, payload, contextMode);

        const messages = normalize(
            payload.message,
            typeof payload.auto_escape === 'string' ? payload.auto_escape === 'true' : !!payload.auto_escape,
        );

        if (getSpecialMsgNum(payload, OB11MessageDataType.node)) {
            const packetMode = this.core.apis.PacketApi.packetStatus;
            let returnMsgAndResId: { message: RawMessage | null, res_id?: string } | null;
            try {
                returnMsgAndResId = packetMode
                    ? await this.handleForwardedNodesPacket(peer, messages as OB11MessageNode[], payload.source, payload.news, payload.summary, payload.prompt)
                    : await this.handleForwardedNodes(peer, messages as OB11MessageNode[]);
            } catch (e: unknown) {
                throw Error(packetMode ? `发送伪造合并转发消息失败: ${(e as Error)?.stack}` : `发送合并转发消息失败: ${(e as Error)?.stack}`);
            }
            if (!returnMsgAndResId) {
                throw Error('发送合并转发消息失败：returnMsgAndResId 为空！');
            }
            if (returnMsgAndResId.message) {
                const msgShortId = MessageUnique.createUniqueMsgId({
                    guildId: '',
                    peerUid: peer.peerUid,
                    chatType: peer.chatType,
                }, (returnMsgAndResId.message).msgId);

                // 对gocq的forward_id进行兼容
                const resId = returnMsgAndResId.res_id!;
                return { message_id: msgShortId!, res_id: resId, forward_id: resId };
            } else if (returnMsgAndResId.res_id && !returnMsgAndResId.message) {
                throw Error(`发送转发消息（res_id：${returnMsgAndResId.res_id} 失败`);
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
        return { message_id: returnMsg.id! };
    }

    private async uploadForwardedNodesPacket(msgPeer: Peer, messageNodes: OB11MessageNode[], source?: string, news?: {
        text: string
    }[], summary?: string, prompt?: string, parentMeta?: {
        user_id: string,
        nickname: string,
    }, dp: number = 0): Promise<{
        finallySendElements: SendArkElement,
        res_id?: string,
        deleteAfterSentFiles: string[],
    } | null> {
        const packetMsg: PacketMsg[] = [];
        let delFiles: string[] = [];
        for (const node of messageNodes) {
            if (dp >= 3) {
                this.core.context.logger.logWarn('转发消息深度超过3层，将停止解析！');
                break;
            }
            if (!node.data.id) {
                const OB11Data = normalize(node.type === OB11MessageDataType.node ? node.data.content : node);
                let sendElements: SendMessageElement[];

                if (getSpecialMsgNum({ message: OB11Data }, OB11MessageDataType.node)) {
                    const uploadReturnData = await this.uploadForwardedNodesPacket(msgPeer, OB11Data as OB11MessageNode[], node.data.source, node.data.news, node.data.summary, node.data.prompt, {
                        user_id: (node.data.user_id ?? node.data.uin)?.toString() ?? parentMeta?.user_id ?? this.core.selfInfo.uin,
                        nickname: (node.data.nickname || node.data.name) ?? parentMeta?.nickname ?? 'QQ用户',
                    }, dp + 1);
                    sendElements = uploadReturnData?.finallySendElements ? [uploadReturnData.finallySendElements] : [];
                    delFiles.push(...(uploadReturnData?.deleteAfterSentFiles || []));
                } else {
                    const sendElementsCreateReturn = await this.obContext.apis.MsgApi.createSendElements(OB11Data, msgPeer);
                    sendElements = sendElementsCreateReturn.sendElements;
                    delFiles.push(...sendElementsCreateReturn.deleteAfterSentFiles);
                }

                const packetMsgElements: rawMsgWithSendMsg = {
                    senderUin: Number((node.data.user_id ?? node.data.uin) ?? parentMeta?.user_id) || +this.core.selfInfo.uin,
                    senderName: (node.data.nickname || node.data.name) ?? parentMeta?.nickname ?? 'QQ用户',
                    groupId: msgPeer.chatType === ChatType.KCHATTYPEGROUP ? +msgPeer.peerUid : 0,
                    time: Number(node.data.time) || Date.now(),
                    msg: sendElements,
                };
                this.core.context.logger.logDebug(`handleForwardedNodesPacket[SendRaw] 开始转换 ${stringifyWithBigInt(packetMsgElements)}`);
                const transformedMsg = this.core.apis.PacketApi.pkt.msgConverter.rawMsgWithSendMsgToPacketMsg(packetMsgElements);
                this.core.context.logger.logDebug(`handleForwardedNodesPacket[SendRaw] 转换为 ${stringifyWithBigInt(transformedMsg)}`);
                packetMsg.push(transformedMsg);
            } else if (node.data.id) {
                const id = node.data.id;
                const nodeMsg = MessageUnique.getMsgIdAndPeerByShortId(+id) || MessageUnique.getPeerByMsgId(id);
                if (!nodeMsg) {
                    this.core.context.logger.logError('转发消息失败，未找到消息', id);
                    continue;
                }
                const msg = (await this.core.apis.MsgApi.getMsgsByMsgId(nodeMsg.Peer, [nodeMsg.MsgId])).msgList[0];
                this.core.context.logger.logDebug(`handleForwardedNodesPacket[PureRaw] 开始转换 ${stringifyWithBigInt(msg)}`);
                if (msg) {
                    let msgCache = await this.core.apis.FileApi.downloadRawMsgMedia([msg]);
                    delFiles.push(...msgCache);
                    const transformedMsg = this.core.apis.PacketApi.pkt.msgConverter.rawMsgToPacketMsg(msg, msgPeer);
                    this.core.context.logger.logDebug(`handleForwardedNodesPacket[PureRaw] 转换为 ${stringifyWithBigInt(transformedMsg)}`);
                    packetMsg.push(transformedMsg);
                }
            } else {
                this.core.context.logger.logDebug(`handleForwardedNodesPacket 跳过元素 ${stringifyWithBigInt(node)}`);
            }
        }
        if (packetMsg.length === 0) {
            this.core.context.logger.logWarn('handleForwardedNodesPacket 元素为空！');
            return null;
        }
        const resid = await this.core.apis.PacketApi.pkt.operation.UploadForwardMsg(packetMsg, msgPeer.chatType === ChatType.KCHATTYPEGROUP ? +msgPeer.peerUid : 0);
        const forwardJson = ForwardMsgBuilder.fromPacketMsg(resid, packetMsg, source, news, summary, prompt);
        return {
            deleteAfterSentFiles: delFiles,
            finallySendElements: {
                elementType: ElementType.ARK,
                elementId: '',
                arkElement: {
                    bytesData: JSON.stringify(forwardJson),
                },
            } as SendArkElement,
            res_id: resid,
        };
    }

    private async handleForwardedNodesPacket(msgPeer: Peer, messageNodes: OB11MessageNode[], source?: string, news?: {
        text: string
    }[], summary?: string, prompt?: string): Promise<{
        message: RawMessage | null,
        res_id?: string
    }> {
        const uploadReturnData = await this.uploadForwardedNodesPacket(msgPeer, messageNodes, source, news, summary, prompt);
        const res_id = uploadReturnData?.res_id;
        const finallySendElements = uploadReturnData?.finallySendElements;
        if (!finallySendElements) throw Error('转发消息失败，生成节点为空');
        const returnMsg = await this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(msgPeer, [finallySendElements], uploadReturnData.deleteAfterSentFiles || []).catch(() => undefined);
        return { message: returnMsg ?? null, res_id: res_id! };
    }

    private async handleForwardedNodes(destPeer: Peer, messageNodes: OB11MessageNode[]): Promise<{
        message: RawMessage | null,
        res_id?: string
    }> {
        const selfPeer = {
            chatType: ChatType.KCHATTYPEC2C,
            peerUid: this.core.selfInfo.uid,
        };
        let nodeMsgIds: string[] = [];
        for (const messageNode of messageNodes) {
            const nodeId = messageNode.data.id;
            if (nodeId) {
                // 对Msgid和OB11ID混用情况兜底
                const nodeMsg = MessageUnique.getMsgIdAndPeerByShortId(parseInt(nodeId)) || MessageUnique.getPeerByMsgId(nodeId);
                if (!nodeMsg) {
                    this.core.context.logger.logError('转发消息失败，未找到消息', nodeId);
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
                            this.core.context.logger.logError('子消息中包含非node消息 跳过不合法部分');
                            continue;
                        }
                        const nodeMsg = await this.handleForwardedNodes(selfPeer, OB11Data.filter(e => e.type === OB11MessageDataType.node));
                        if (nodeMsg) {
                            nodeMsgIds.push(nodeMsg.message!.msgId);
                            MessageUnique.createUniqueMsgId(selfPeer, nodeMsg.message!.msgId);
                        }
                        //完成子卡片生成跳过后续
                        continue;
                    }
                    const { sendElements } = await this.obContext.apis.MsgApi
                        .createSendElements(OB11Data, destPeer);

                    //拆分消息

                    const MixElement = sendElements.filter(
                        element =>
                            element.elementType !== ElementType.FILE && element.elementType !== ElementType.VIDEO && element.elementType !== ElementType.ARK
                    );
                    const SingleElement = sendElements.filter(
                        element =>
                            element.elementType === ElementType.FILE || element.elementType === ElementType.VIDEO || element.elementType === ElementType.ARK
                    ).map(e => [e]);

                    const AllElement: SendMessageElement[][] = [MixElement, ...SingleElement].filter(e => e !== undefined && e.length !== 0);
                    const MsgNodeList: Promise<RawMessage | undefined>[] = [];
                    for (const sendElementsSplitElement of AllElement) {
                        MsgNodeList.push(this.obContext.apis.MsgApi.sendMsgWithOb11UniqueId(selfPeer, sendElementsSplitElement, []).catch(() => undefined));
                    }
                    (await Promise.allSettled(MsgNodeList)).map((result) => {
                        if (result.status === 'fulfilled' && result.value) {
                            nodeMsgIds.push(result.value.msgId);
                            MessageUnique.createUniqueMsgId(selfPeer, result.value.msgId);
                        }
                    });
                } catch (e: unknown) {
                    this.core.context.logger.logDebug('生成转发消息节点失败', (e as Error).stack);
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
                this.core.context.logger.logError('转发消息失败，未找到消息', msgId);
                continue;
            }
            const nodeMsg = (await this.core.apis.MsgApi.getMsgsByMsgId(nodeMsgPeer.Peer, [msgId])).msgList[0];
            if (nodeMsg) {
                srcPeer = srcPeer ?? { chatType: nodeMsg.chatType, peerUid: nodeMsg.peerUid };
                if (srcPeer.peerUid !== nodeMsg.peerUid) {
                    needSendSelf = true;
                }
                nodeMsgArray.push(nodeMsg);
            }
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
            this.core.context.logger.logDebug('开发转发', srcPeer, destPeer, retMsgIds);
            return {
                message: await this.core.apis.MsgApi.multiForwardMsg(srcPeer!, destPeer, retMsgIds)
            };
        } catch (e: unknown) {
            this.core.context.logger.logError('forward failed', (e as Error)?.stack);
            return {
                message: null
            };
        }
    }

    async cloneMsg(msg: RawMessage): Promise<RawMessage | undefined> {
        const selfPeer = {
            chatType: ChatType.KCHATTYPEC2C,
            peerUid: this.core.selfInfo.uid,
        };
        //msg 为待克隆消息
        const sendElements: SendMessageElement[] = [];

        for (const element of msg.elements) {
            sendElements.push(element as SendMessageElement);
        }

        if (sendElements.length === 0) {
            this.core.context.logger.logDebug('需要clone的消息无法解析，将会忽略掉', msg);
        }
        try {
            return await this.core.apis.MsgApi.sendMsg(selfPeer, sendElements);
        } catch (e: unknown) {
            this.core.context.logger.logError((e as Error)?.stack, '克隆转发消息失败,将忽略本条消息', msg);
        }
        return;
    }
}
export default class SendMsg extends SendMsgBase {
    override actionName = ActionName.SendMsg;
}
